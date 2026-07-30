export type DirectStorageUploadError = {
  status: number;
  message: string;
};

export type DirectStorageUploadProgress = {
  percent: number;
  loaded: number;
  total: number;
  phase: "uploading" | "processing" | "complete";
};

export type DirectStoragePresignResponse = {
  key: string;
  uploadUrl: string;
  url: string;
  contentType?: string;
  error?: string;
  code?: string;
};

function rejectUpload(status: number, message: string): Promise<never> {
  return Promise.reject({
    status,
    message,
  } satisfies DirectStorageUploadError);
}

export function reportDirectUploadProgress(
  onProgress:
    | ((update: DirectStorageUploadProgress) => void)
    | undefined,
  update: DirectStorageUploadProgress,
) {
  onProgress?.(update);
}

export function isStorageTransportFailure(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const status =
    "status" in err ? Number((err as { status: unknown }).status) : NaN;
  return status === 0 || status === 403;
}

export async function requestDirectUploadPresign(
  endpoint: string,
  body: {
    fileName: string;
    contentType: string;
    contentLength: number;
    purpose?: string;
  },
): Promise<DirectStoragePresignResponse | null> {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (res.status === 503) {
    return null;
  }

  let data: DirectStoragePresignResponse;
  try {
    data = (await res.json()) as DirectStoragePresignResponse;
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

export function putFileToStorage(
  uploadUrl: string,
  file: File,
  contentType: string,
  onProgress?: (update: DirectStorageUploadProgress) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", contentType);

    xhr.upload.addEventListener("loadstart", () => {
      reportDirectUploadProgress(onProgress, {
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
        reportDirectUploadProgress(onProgress, {
          percent: 0,
          loaded,
          total: file.size,
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
        resolve();
        return;
      }
      reject({
        status: xhr.status,
        message:
          xhr.status === 403
            ? "Storage rejected the upload. Check bucket CORS and signed URL settings."
            : "Direct storage upload failed. Try again.",
      } satisfies DirectStorageUploadError);
    });

    xhr.addEventListener("error", () => {
      reject({
        status: 0,
        message:
          "Could not reach storage directly. Check bucket CORS and server URL settings.",
      } satisfies DirectStorageUploadError);
    });

    xhr.addEventListener("abort", () => {
      reject({
        status: 0,
        message: "Upload cancelled",
      } satisfies DirectStorageUploadError);
    });

    xhr.send(file);
  });
}
