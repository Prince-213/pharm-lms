import {
  isStorageTransportFailure,
  putFileToStorage,
  reportDirectUploadProgress,
  requestDirectUploadPresign,
  type DirectStorageUploadError,
  type DirectStorageUploadProgress,
} from "@/lib/upload/direct-storage-upload";

export type CourseFileUploadResult = { url: string };
export type CourseFileUploadError = DirectStorageUploadError;
export type CourseFileUploadProgress = DirectStorageUploadProgress;

async function requestPresign(courseId: string, purpose: string, file: File) {
  return requestDirectUploadPresign(
    `/api/tutor/courses/${courseId}/upload/presign`,
    {
      purpose,
      fileName: file.name,
      contentType: file.type || "application/octet-stream",
      contentLength: file.size,
    },
  );
}

function uploadViaAppProxy(
  courseId: string,
  formData: FormData,
  fileSize: number,
  onProgress?: (update: CourseFileUploadProgress) => void,
): Promise<CourseFileUploadResult> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `/api/tutor/courses/${courseId}/upload`);

    xhr.upload.addEventListener("loadstart", () => {
      reportDirectUploadProgress(onProgress, {
        percent: 0,
        loaded: 0,
        total: fileSize,
        phase: "uploading",
      });
    });

    xhr.upload.addEventListener("progress", (event) => {
      const total =
        event.lengthComputable && event.total > 0 ? event.total : fileSize;
      const loaded = event.loaded;
      if (total <= 0) {
        reportDirectUploadProgress(onProgress, {
          percent: 0,
          loaded,
          total: fileSize,
          phase: "uploading",
        });
        return;
      }

      const rawPercent = Math.round((loaded / total) * 100);
      const bytesSent = loaded >= total;
      reportDirectUploadProgress(onProgress, {
        percent: bytesSent ? 99 : Math.min(98, rawPercent),
        loaded: Math.min(loaded, total),
        total,
        phase: bytesSent ? "processing" : "uploading",
      });
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText) as CourseFileUploadResult;
          if (!data.url) {
            reject({ status: xhr.status, message: "Upload failed" });
            return;
          }
          reportDirectUploadProgress(onProgress, {
            percent: 100,
            loaded: fileSize,
            total: fileSize,
            phase: "complete",
          });
          resolve(data);
        } catch {
          reject({ status: xhr.status, message: "Invalid upload response" });
        }
        return;
      }

      let message = "Upload failed";
      try {
        const body = JSON.parse(xhr.responseText) as { error?: string };
        if (body.error) message = body.error;
      } catch {
        // ignore parse errors
      }

      if (xhr.status === 413) {
        message =
          "This upload is being rejected before it reaches storage. Use direct R2 uploads or increase your proxy body-size limit.";
      } else if (xhr.status === 503) {
        message =
          message === "Upload failed"
            ? "File storage is not configured on the server. Contact support."
            : message;
      } else if (xhr.status === 502) {
        message =
          message === "Upload failed"
            ? "Storage upload failed. Try again."
            : message;
      } else if (xhr.status === 403 || xhr.status === 409) {
        message =
          message === "Upload failed"
            ? "This course cannot be edited right now. Save as draft first."
            : message;
      }

      reject({ status: xhr.status, message });
    });

    xhr.addEventListener("error", () => {
      reject({ status: 0, message: "Network error during upload" });
    });

    xhr.addEventListener("abort", () => {
      reject({ status: 0, message: "Upload cancelled" });
    });

    xhr.send(formData);
  });
}

/**
 * Upload course media.
 * - Prefer browser → R2 direct uploads whenever storage is configured.
 * - Fall back to the app proxy only when R2 is unavailable (local/dev).
 */
export async function uploadCourseFileWithProgress(
  courseId: string,
  formData: FormData,
  onProgress?: (update: CourseFileUploadProgress) => void,
): Promise<CourseFileUploadResult> {
  const file = formData.get("file");
  const purpose = String(formData.get("purpose") ?? "lesson-video");

  if (!(file instanceof File)) {
    return Promise.reject({ status: 400, message: "Missing file" });
  }

  const presign = await requestPresign(courseId, purpose, file);
  if (!presign) {
    return uploadViaAppProxy(courseId, formData, file.size, onProgress);
  }

  reportDirectUploadProgress(onProgress, {
    percent: 0,
    loaded: 0,
    total: file.size,
    phase: "uploading",
  });

  try {
    await putFileToStorage(
      presign.uploadUrl,
      file,
      presign.contentType || file.type || "application/octet-stream",
      onProgress,
    );
  } catch (err) {
    if ((err as { message?: string })?.message === "Upload cancelled") {
      throw err;
    }
    if (isStorageTransportFailure(err)) {
      return Promise.reject({
        status: 502,
        message:
          "Direct upload to storage failed. Check R2 CORS and the site URL/origin configuration.",
      } satisfies CourseFileUploadError);
    }
    throw err;
  }

  reportDirectUploadProgress(onProgress, {
    percent: 99,
    loaded: file.size,
    total: file.size,
    phase: "processing",
  });

  try {
    await fetch(`/api/tutor/courses/${courseId}/upload/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: presign.key, purpose }),
    });
  } catch {
    // Cache revalidation is best-effort; object is already stored.
  }

  reportDirectUploadProgress(onProgress, {
    percent: 100,
    loaded: file.size,
    total: file.size,
    phase: "complete",
  });

  return { url: presign.url };
}
