export type CourseFileUploadResult = { url: string };

export type CourseFileUploadError = {
  status: number;
  message: string;
};

export type CourseFileUploadProgress = {
  percent: number;
  loaded: number;
  total: number;
  phase: "uploading" | "processing" | "complete";
};

type PresignResponse = {
  key: string;
  uploadUrl: string;
  url: string;
  contentType?: string;
  error?: string;
  code?: string;
};

function rejectUpload(status: number, message: string): Promise<never> {
  return Promise.reject({ status, message } satisfies CourseFileUploadError);
}

function reportProgress(
  onProgress: ((update: CourseFileUploadProgress) => void) | undefined,
  update: CourseFileUploadProgress,
) {
  onProgress?.(update);
}

function isDirectUploadFailure(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const status = "status" in err ? Number((err as { status: unknown }).status) : NaN;
  // 0 = network/CORS blocked by the browser; 403 = signed URL / CORS rejection.
  return status === 0 || status === 403;
}

async function requestPresign(
  courseId: string,
  purpose: string,
  file: File,
): Promise<PresignResponse | null> {
  const res = await fetch(`/api/tutor/courses/${courseId}/upload/presign`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      purpose,
      fileName: file.name,
      contentType: file.type || "application/octet-stream",
      contentLength: file.size,
    }),
  });

  if (res.status === 503) {
    // R2 not configured — caller may fall back to proxied upload.
    return null;
  }

  let data: PresignResponse;
  try {
    data = (await res.json()) as PresignResponse;
  } catch {
    await rejectUpload(res.status || 502, "Could not start file upload.");
    return null;
  }

  if (!res.ok || !data.uploadUrl || !data.key || !data.url) {
    await rejectUpload(
      res.status || 502,
      data.error || "Could not start file upload.",
    );
    return null;
  }

  return data;
}

function putFileToStorage(
  uploadUrl: string,
  file: File,
  contentType: string,
  onProgress?: (update: CourseFileUploadProgress) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", contentType);

    xhr.upload.addEventListener("loadstart", () => {
      reportProgress(onProgress, {
        percent: 0,
        loaded: 0,
        total: file.size,
        phase: "uploading",
      });
    });

    xhr.upload.addEventListener("progress", (event) => {
      const total =
        event.lengthComputable && event.total > 0 ? event.total : file.size;
      const loaded = event.loaded;
      if (total <= 0) {
        reportProgress(onProgress, {
          percent: 0,
          loaded,
          total: file.size,
          phase: "uploading",
        });
        return;
      }

      const rawPercent = Math.round((loaded / total) * 100);
      const bytesSent = loaded >= total;
      reportProgress(onProgress, {
        percent: bytesSent ? 99 : Math.min(98, rawPercent),
        loaded: Math.min(loaded, total),
        total,
        phase: bytesSent ? "processing" : "uploading",
      });
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
        return;
      }
      reject({
        status: xhr.status,
        message:
          xhr.status === 403
            ? "Upload was rejected by storage."
            : "Storage upload failed. Try again.",
      } satisfies CourseFileUploadError);
    });

    xhr.addEventListener("error", () => {
      reject({
        status: 0,
        message: "Network error during direct storage upload.",
      } satisfies CourseFileUploadError);
    });

    xhr.addEventListener("abort", () => {
      reject({
        status: 0,
        message: "Upload cancelled",
      } satisfies CourseFileUploadError);
    });

    xhr.send(file);
  });
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
      reportProgress(onProgress, {
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
        reportProgress(onProgress, {
          percent: 0,
          loaded,
          total: fileSize,
          phase: "uploading",
        });
        return;
      }

      const rawPercent = Math.round((loaded / total) * 100);
      const bytesSent = loaded >= total;
      reportProgress(onProgress, {
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
          reportProgress(onProgress, {
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
          "File is too large for this server. Large videos need R2 CORS so they can upload directly to storage.";
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
 * - Small files: always through the Next.js → R2 proxy (no browser CORS needed).
 * - Larger files (>4MB): try direct browser→R2, then fall back to the proxy if
 *   the PUT fails (almost always missing bucket CORS).
 */
export async function uploadCourseFileWithProgress(
  courseId: string,
  formData: FormData,
  onProgress?: (update: CourseFileUploadProgress) => void,
): Promise<CourseFileUploadResult> {
  const file = formData.get("file");
  const purpose = String(formData.get("purpose") ?? "lesson-video");

  if (!(file instanceof File)) {
    return rejectUpload(400, "Missing file");
  }

  const preferDirect = file.size > 4 * 1024 * 1024;

  if (!preferDirect) {
    return uploadViaAppProxy(courseId, formData, file.size, onProgress);
  }

  const presign = await requestPresign(courseId, purpose, file);
  if (!presign) {
    return uploadViaAppProxy(courseId, formData, file.size, onProgress);
  }

  reportProgress(onProgress, {
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
    if (!isDirectUploadFailure(err)) {
      throw err;
    }
    console.warn(
      "[upload] Direct R2 PUT failed; falling back to server proxy.",
      err,
    );
    return uploadViaAppProxy(courseId, formData, file.size, onProgress);
  }

  reportProgress(onProgress, {
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

  reportProgress(onProgress, {
    percent: 100,
    loaded: file.size,
    total: file.size,
    phase: "complete",
  });

  return { url: presign.url };
}
