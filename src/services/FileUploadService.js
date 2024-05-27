import axios from "../CommonHTTP";

const upload = (file, onUploadProgress) => {
    let formData = new FormData();

    formData.append("file", file);

    return axios.post("/upload", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
        onUploadProgress,
    });
};

const getFiles = () => {
    return axios.get("/files");
};

const deleteAll = () => {
    return axios.delete("/files");
};

const deleteFile = (fileName) => {
    return axios.delete(`/files/${fileName}`);
};

const download = (fileName) => {
    return axios.get(`/uploads/${fileName}`, {
        responseType: 'blob',
    });
};

const downloadAllAsZip = () => {
    return axios.get("/files/zip", {
        responseType: "blob",
    });
};

const FileUploadService = {
    upload,
    getFiles,
    deleteAll,
    deleteFile,
    download,
    downloadAllAsZip
};

export default FileUploadService;
