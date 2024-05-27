import { useState, useEffect, useRef } from 'react';
import UploadService from '../services/FileUploadService';
import { Delete, Download, HardDriveDownload, RotateCcw } from "lucide-react";

export default function UploadImages() {
    const [selectedFiles, setSelectedFiles] = useState(undefined);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [progressInfos, setProgressInfos] = useState({ val: [] });
    const [messages, setMessages] = useState([]);
    const [imageInfos, setImageInfos] = useState([]);
    const progressInfoRef = useRef(null);

    useEffect(() => {
        fetchImageInfos();
    }, []);

    const fetchImageInfos = () => {
        UploadService.getFiles().then((response) => {
            setImageInfos(response.data);
        });
    };

    const selectFiles = (event) => {
        let images = [];
        for (let i = 0; i < event.target.files.length; i++) {
            images.push(URL.createObjectURL(event.target.files[i]));
        }
        setSelectedFiles(event.target.files);
        setImagePreviews(images);
        setProgressInfos({ val: [] });
        setMessages([]);
    };

    const handleUpload = () => {
        if (!selectedFiles) {
            return;
        }

        let files = Array.from(selectedFiles);
        let _progressInfos = files.map((file) => ({
            percentage: 0,
            fileName: file.name,
        }));

        progressInfoRef.current = {
            val: _progressInfos,
        };

        const uploadPromises = files.map((file, i) => upload(i, file));
        Promise.all(uploadPromises)
            .then(fetchImageInfos);
    };

    const upload = async (idx, file) => {
        let _progressInfos = [...progressInfoRef.current.val];
        try {
            await UploadService.upload(file, (event) => {
                _progressInfos[idx].percentage = Math.round(
                    (100 * event.loaded) / event.total
                );
                setProgressInfos({ val: _progressInfos });
            });
            setMessages((prevMessage) => [
                ...prevMessage,
                "Uploaded the image successfully: " + file.name,
            ]);
        } catch {
            _progressInfos[idx].percentage = 0;
            setProgressInfos({ val: _progressInfos });

            setMessages((prevMessage) => [
                ...prevMessage,
                "Could not upload the image: " + file.name,
            ]);
        }
    };

    const handleResetAll = () => {
        UploadService.deleteAll().then(() => {
            setImageInfos([]);
            setImagePreviews([]);
            setSelectedFiles(undefined);
            setMessages(["All images have been deleted. No images found. Please upload a new image."]);
            setProgressInfos({ val: [] });
        });
    };

    const downloadImage = (fileName) => {
        UploadService.download(fileName).then((response) => {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);

            // Clear the image previews and progress info
            setImagePreviews([]);
            setProgressInfos({ val: [] });

            // Show the message
            setMessages([`Downloaded the image: ${fileName}`]);
        });
    };

    const deleteImage = (fileName) => {
        UploadService.deleteFile(fileName).then(() => {
            fetchImageInfos();

            // Clear the image previews and progress info
            setImagePreviews([]);
            setProgressInfos({ val: [] });

            // Show the message
            setMessages([`Deleted the image: ${fileName}`]);
        });
    };

    const downloadAllImagesAsZip = () => {
        UploadService.downloadAllAsZip().then((response) => {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "files.zip");
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);

            // Clear the image previews and progress info
            setImagePreviews([]);
            setProgressInfos({ val: [] });

            // Show the message
            setMessages(["Downloaded all images as a zip file."]);
        });
    };
    return (
        <div className="container mx-auto p-4">
            <div className="flex flex-col md:flex-row items-center justify-between mb-4">
                <label className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded cursor-pointer transition-colors">
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={selectFiles}
                        className="hidden"
                    />
                    Select Files
                </label>
                <button
                    className={`bg-green-500 hover:bg-green-600 text-white py-3 px-5 rounded ml-0 md:ml-4 mt-4 md:mt-0 transition-colors ${!selectedFiles ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={!selectedFiles}
                    onClick={handleUpload}
                >
                    Upload
                </button>
            </div>

            {messages.length > 0 && (
                <div className="bg-gray-200 p-4 mt-4 rounded">
                    <ul>
                        {messages.map((item, i) => (
                            <li key={i} className="text-gray-700">{item}</li>
                        ))}
                    </ul>
                </div>
            )}

            {progressInfos.val.length > 0 && progressInfos.val.map((progressInfo, index) => (
                <div className="mb-2" key={index}>
                    <span className="block text-gray-700 mb-1">{progressInfo.fileName}</span>
                    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                        <div
                            className="bg-blue-500 h-4 flex items-center justify-center text-white text-sm"
                            style={{ width: progressInfo.percentage + "%" }}
                        >
                            {progressInfo.percentage}%
                        </div>
                    </div>
                </div>
            ))}

            {imagePreviews.length > 0 && (
                <div className="flex flex-wrap mt-4">
                    {imagePreviews.map((img, i) => (
                        <img
                            className="w-1/4 sm:w-1/5 md:w-1/6 lg:w-1/8 p-1 object-cover"
                            src={img}
                            alt={"image-" + i}
                            key={i}
                        />
                    ))}
                </div>
            )}

            {imageInfos.length > 0 && (
                <div className="bg-white shadow-lg rounded-lg mt-6 overflow-hidden">
                    <div className="bg-gray-200 p-4 text-lg font-semibold flex justify-between items-center">
                        <span>List of Images</span>
                        <div>

                            <div class="flex items-center justify-end space-x-2">
                                <HardDriveDownload size={24} color="#00ff04" onClick={downloadAllImagesAsZip} className="cursor-pointer" />
                                <RotateCcw size={24} color="#ff0000" onClick={handleResetAll} className="cursor-pointer" />
                            </div>

                        </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4 p-4 font-semibold bg-gray-100">
                        <div>File Name</div>
                        <div>File Size</div>
                        <div>Actions</div>
                    </div>
                    <ul className="divide-y divide-gray-300">
                        {imageInfos.map((img, index) => (
                            <li className="p-4 grid grid-cols-4 gap-4 items-center" key={index}>
                                <div>
                                    <a href={img.url} className="text-blue-600 hover:text-blue-800 text-center break-words">
                                        {img.name}
                                    </a>
                                </div>
                                <div>{img.size} KB</div>
                                <div class="flex items-center justify-center space-x-2">
                                    <Download size={32} color="#00ff6e" strokeWidth={1.75} onClick={() => downloadImage(img.name)} className="cursor-pointer" />
                                    <Delete size={32} color="#ff0000" strokeWidth={1.75} onClick={() => deleteImage(img.name)} className="cursor-pointer" />
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
