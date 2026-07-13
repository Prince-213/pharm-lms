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

export function uploadCourseFileWithProgress(
  courseId: string,
  formData: FormData,
  onProgress?: (update: CourseFileUploadProgress) => void,
): Promise<CourseFileUploadResult> {
  const file = formData.get("file");
  const fileSize = file instanceof File ? file.size : 0;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `/api/tutor/courses/${courseId}/upload`);

    const report = (update: CourseFileUploadProgress) => {
      onProgress?.(update);
    };

    xhr.upload.addEventListener("loadstart", () => {
      report({
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
        report({
          percent: 0,
          loaded,
          total: fileSize,
          phase: "uploading",
        });
        return;
      }

      const rawPercent = Math.round((loaded / total) * 100);
      const bytesSent = loaded >= total;
      report({
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
          report({
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
        message = "File is too large for the server. Try a smaller file.";
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
