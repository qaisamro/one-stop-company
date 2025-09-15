import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaTrashAlt, FaSpinner, FaUpload } from 'react-icons/fa';
import imageCompression from 'browser-image-compression';

const AdminGallery = () => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [newImage, setNewImage] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // Use environment variable or fallback to production URL
    const API_URL = process.env.REACT_APP_API_URL || 'https://one-stop.ps';
    const token = localStorage.getItem('token');

    // Fetch images from API
    const fetchImages = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/gallery`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setImages(response.data.images || []);
            setError('');
        } catch (err) {
            console.error('Error fetching images:', err);
            setError('Failed to load images. Please check your network and try again.');
        } finally {
            setLoading(false);
        }
    };

    // Handle image file selection and compression
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Compress the image before setting it
        const options = {
            maxSizeMB: 1, // Max size 1 MB
            maxWidthOrHeight: 1920,
            useWebWorker: true,
        };

        try {
            const compressedFile = await imageCompression(file, options);
            setNewImage(compressedFile);
            setMessage('Image selected successfully. Ready to upload.');
            setError('');
        } catch (error) {
            console.error('Image compression error:', error);
            setError('Failed to compress image. Please try another one.');
        }
    };

    // Add a new image
    const handleAddImage = async (e) => {
        e.preventDefault();
        if (!newImage) {
            setError('Please select an image to upload.');
            return;
        }

        setUploading(true);
        setError('');
        setMessage('');

        const formData = new FormData();
        formData.append('image', newImage);

        try {
            const response = await axios.post(`${API_URL}/gallery`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            setMessage('Image uploaded successfully! ✅');
            setNewImage(null);
            document.getElementById('image-input').value = '';
            await fetchImages();
            // Log the response to verify the database record
            console.log('Upload response:', response.data);
        } catch (err) {
            console.error('Error uploading image:', err.response?.data || err.message);
            setError('Failed to upload image: ' + (err.response?.data?.error || 'Please check the file and try again.'));
        } finally {
            setUploading(false);
            setTimeout(() => setMessage('') || setError(''), 5000);
        }
    };

    // Delete an image
    const handleDeleteImage = async (id) => {
        if (!window.confirm('Are you sure you want to delete this image?')) {
            return;
        }

        try {
            await axios.delete(`${API_URL}/gallery/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage('Image deleted successfully! 🗑️');
            await fetchImages();
        } catch (err) {
            console.error('Error deleting image:', err.response?.data || err.message);
            setError('Failed to delete image: ' + (err.response?.data?.error || 'Please try again.'));
        } finally {
            setTimeout(() => setMessage('') || setError(''), 5000);
        }
    };

    useEffect(() => {
        fetchImages();
    }, []);

    return (
        <div className="bg-white shadow-xl p-6 sm:p-8 rounded-2xl w-full max-w-4xl mx-auto transition-all duration-300">
            <h1 className="text-3xl font-bold mb-6 text-gray-800 tracking-tight text-center">إدارة معرض الصور</h1>
            <p className="text-center text-gray-600 mb-8">يمكنك هنا إضافة أو حذف الصور من معرض الموقع.</p>

            {/* Add Image Form */}
            <form onSubmit={handleAddImage} className="bg-gray-50 p-6 rounded-lg shadow-inner mb-8 border border-dashed border-gray-200">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <FaPlus className="text-green-500" /> إضافة صورة جديدة
                </h2>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <label htmlFor="image-input" className="cursor-pointer bg-[#3C4196] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#2f337a] transition-colors duration-200">
                        <FaUpload className="inline-block mr-2" />
                        اختر صورة
                    </label>
                    <input
                        type="file"
                        id="image-input"
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                        required
                    />
                    {newImage && (
                        <span className="text-gray-700 text-sm italic">
                            {newImage.name} ({Math.round(newImage.size / 1024)} KB)
                        </span>
                    )}
                </div>
                {newImage && (
                    <div className="flex justify-center mt-4">
                        <img src={URL.createObjectURL(newImage)} alt="Preview" className="max-w-xs h-auto rounded-lg shadow-md" />
                    </div>
                )}
                <div className="mt-6 flex justify-center">
                    <button
                        type="submit"
                        disabled={uploading}
                        className={`py-3 px-8 rounded-lg font-bold transition-all duration-200 ${uploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                    >
                        {uploading ? (
                            <span className="flex items-center gap-2">
                                <FaSpinner className="animate-spin" /> جاري التحميل...
                            </span>
                        ) : (
                            'تحميل الصورة'
                        )}
                    </button>
                </div>
            </form>

            {message && <div className="text-green-600 bg-green-100 p-3 rounded-lg text-center mb-4">{message}</div>}
            {error && <div className="text-red-600 bg-red-100 p-3 rounded-lg text-center mb-4">{error}</div>}

            {/* Display Images */}
            <div className="mt-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">الصور الحالية</h2>
                {loading ? (
                    <div className="flex justify-center items-center h-48">
                        <FaSpinner className="animate-spin text-4xl text-[#3C4196]" />
                    </div>
                ) : images.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {images.map((image) => (
                            <div key={image.id} className="relative group overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                                <img
                                    src={image.path}
                                    alt="Gallery"
                                    className="w-full h-40 object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        console.error(`Failed to load image: ${image.path}`);
                                    }}
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <button
                                        onClick={() => handleDeleteImage(image.id)}
                                        className="text-white bg-red-600 hover:bg-red-700 p-3 rounded-full transition-colors"
                                        aria-label="Delete image"
                                    >
                                        <FaTrashAlt />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-500">لا توجد صور في المعرض حالياً.</p>
                )}
            </div>
        </div>
    );
};

export default AdminGallery;