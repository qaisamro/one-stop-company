import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosInstance } from '../api/axiosConfig';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Define base URL for images based on Laravel server
const BASE_IMAGE_URL = 'https://one-stop.ps';

const AdminBlogs = () => {
    const [blogs, setBlogs] = useState([]);
    const [form, setForm] = useState({
        title: '',
        description: '',
        // Set initial date to current local date
        date: new Date().toISOString().split('T')[0],
        language: 'ar',
        // Author and category are now optional, so default to empty strings or initial values
        author: '',
        category: '',
        // Content is also optional, so it can be an empty string
        content: '',
        delete_image: false,
    });
    const [imageFile, setImageFile] = useState(null);
    const [additionalImageFiles, setAdditionalImageFiles] = useState([]);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [editingBlogId, setEditingBlogId] = useState(null);
    const [currentImageUrl, setCurrentImageUrl] = useState('');
    const [existingAdditionalImageUrls, setExistingAdditionalImageUrls] = useState([]);
    const sidebarRef = useRef(null);
    const navigate = useNavigate();

    // State to track image load errors
    const [failedImageLoadIds, setFailedImageLoadIds] = useState(new Set());

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token || token === 'undefined' || token === 'null') {
            navigate('/admin/login');
        } else {
            fetchBlogs();
        }
    }, [form.language, navigate]);

    const fetchBlogs = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(`/api/blogs?lang=${form.language}`);
            console.log('Fetched blogs:', response.data);
            const updatedBlogs = response.data.map((blog) => ({
                ...blog,
                image: blog.image ? `${BASE_IMAGE_URL}${blog.image.startsWith('/') ? '' : '/'}${blog.image}` : null,
                additional_images: blog.additional_images
                    ? blog.additional_images.map((img) => `${BASE_IMAGE_URL}${img.startsWith('/') ? '' : '/'}${img}`)
                    : [],
            }));
            setBlogs(updatedBlogs);
            setError('');
        } catch (err) {
            console.error('Error fetching blogs:', err.response ? err.response.data : err);
            setError('Failed to load blogs');
            toast.error('Failed to load blogs');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleQuillChange = (value) => {
        setForm({ ...form, content: value });
    };

    const handleFileChange = (e) => {
        setImageFile(e.target.files[0]);
        setForm({ ...form, delete_image: false });
    };

    const handleAdditionalFilesChange = (e) => {
        setAdditionalImageFiles(Array.from(e.target.files));
    };

    const handleRemoveAdditionalImage = (indexToRemove) => {
        setExistingAdditionalImageUrls((prev) => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleRemoveMainImage = () => {
        setImageFile(null);
        setCurrentImageUrl('');
        setForm({ ...form, delete_image: true });
    };

    const handleEdit = (blog) => {
        console.log('Editing blog:', blog);
        setEditingBlogId(blog.id);
        setForm({
            title: blog.title || '',
            description: blog.description || '',
            date: blog.date || new Date().toISOString().split('T')[0], // Ensure date is set
            language: blog.language || 'ar',
            // Set optional fields to their current values or empty
            author: blog.author || '',
            category: blog.category || '',
            content: blog.content || '',
            delete_image: false,
        });
        setCurrentImageUrl(blog.image || '');
        setExistingAdditionalImageUrls(blog.additional_images || []);
        setImageFile(null);
        setAdditionalImageFiles([]);
        setMessage('');
        setError('');
        setFailedImageLoadIds(new Set());
        window.scrollTo({ top: 0, behavior: 'auto' });
    };

    const handleCancelEdit = () => {
        setEditingBlogId(null);
        setForm({ title: '', description: '', date: new Date().toISOString().split('T')[0], language: 'ar', author: '', category: '', content: '', delete_image: false });
        setImageFile(null);
        setAdditionalImageFiles([]);
        setCurrentImageUrl('');
        setExistingAdditionalImageUrls([]);
        setError('');
        setMessage('');
        setFailedImageLoadIds(new Set());
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Basic validation for required fields
        if (!form.title || !form.description || !form.date || !form.language) {
            setError('Please fill in all required fields (Title, Description, Date, Language).');
            toast.error('Please fill in all required fields.');
            return;
        }
        setLoading(true);
        setError('');
        setMessage('');

        const formData = new FormData();
        formData.append('title', form.title);
        formData.append('description', form.description);
        formData.append('content', form.content); // Content is now optional
        formData.append('date', form.date);
        formData.append('language', form.language);
        // Append optional fields only if they have values
        if (form.author) formData.append('author', form.author);
        if (form.category) formData.append('category', form.category);

        if (imageFile) {
            formData.append('image', imageFile);
        }
        if (form.delete_image) {
            formData.append('delete_image', 'true');
        }

        if (existingAdditionalImageUrls.length > 0) {
            formData.append(
                'existingAdditionalImages',
                JSON.stringify(
                    existingAdditionalImageUrls.map((url) => url.replace(BASE_IMAGE_URL, ''))
                )
            );
        }

        additionalImageFiles.forEach((file) => {
            formData.append('additionalImages[]', file);
        });

        // Log formData contents for debugging
        for (let [key, value] of formData.entries()) {
            console.log(`${key}: ${value}`);
        }

        try {
            let response;
            if (editingBlogId) {
                formData.append('_method', 'PUT'); // This is key for PUT requests with FormData
                response = await axiosInstance.post(`/api/blogs/${editingBlogId}`, formData, {
                    headers: {
                        // 'Content-Type': 'multipart/form-data' // axios handles this automatically
                    },
                });
                setMessage('Blog updated successfully! ✅');
                toast.success('Blog updated successfully!');
            } else {
                response = await axiosInstance.post('/api/blogs', formData, {
                    headers: {
                        // 'Content-Type': 'multipart/form-data'
                    },
                });
                setMessage('Blog added successfully! ✅');
                toast.success('Blog added successfully!');
            }

            // Reset form and states after successful submission
            setForm({ title: '', description: '', date: new Date().toISOString().split('T')[0], language: form.language, author: '', category: '', content: '', delete_image: false });
            setImageFile(null);
            setAdditionalImageFiles([]);
            setCurrentImageUrl('');
            setExistingAdditionalImageUrls([]);
            setEditingBlogId(null);
            setFailedImageLoadIds(new Set());
            fetchBlogs();
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            console.error(editingBlogId ? 'Error updating blog:' : 'Error adding blog:', err.response ? err.response.data : err);
            const errorMsg = (editingBlogId ? 'Failed to update blog: ' : 'Failed to add blog: ') + (err.response?.data?.message || err.message);
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        setLoading(true);
        setError('');
        setMessage('');
        try {
            await axiosInstance.delete(`/api/blogs/${id}`);
            setMessage('Blog deleted successfully! ✅');
            toast.success('Blog deleted successfully!');
            fetchBlogs();
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            console.error('Error deleting blog:', err.response ? err.response.data : err);
            const errorMsg = 'Failed to delete blog: ' + (err.response?.data?.error || err.message);
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target) && window.innerWidth < 768) {
                setIsSidebarOpen(false);
            }
        };
        if (isSidebarOpen && window.innerWidth < 768) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isSidebarOpen]);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const modules = {
        toolbar: [
            [{ header: '1' }, { header: '2' }, { font: [] }],
            [{ size: [] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
            ['link', 'image', 'video'],
            ['clean'],
        ],
    };

    const formats = [
        'header', 'font', 'size', 'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet', 'indent', 'link', 'image', 'video',
    ];

    // New function to handle image load errors uniquely
    const handleImageError = (e, identifier, imageUrl) => {
        if (!failedImageLoadIds.has(identifier)) {
            setFailedImageLoadIds((prev) => new Set(prev).add(identifier));
            e.target.src = '/placeholder-image.jpg'; // Fallback image
            console.error(`Failed to load image [${identifier}]:`, imageUrl);
            toast.warn(`Failed to load image: ${imageUrl}. Displaying fallback.`);
        } else {
            e.target.src = '/placeholder-image.jpg'; // Just set fallback if error already logged
        }
    };


    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-row-reverse font-sans">
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick pauseOnHover />
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-60 md:hidden z-40 transition-opacity duration-300"
                    onClick={toggleSidebar}
                ></div>
            )}

            <div className="flex-1 p-4 sm:p-6 md:p-8">
                {/* <button
                    onClick={toggleSidebar}
                    className="md:hidden mb-6 text-gray-700 focus:outline-none p-3 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                    aria-label="Open sidebar"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button> */}

                <div className="bg-white shadow-xl p-6 sm:p-8 rounded-2xl w-full max-w-3xl mx-auto transition-all duration-300">
                    <h2 className="text-3xl font-bold mb-6 text-gray-800 tracking-tight">
                        {editingBlogId ? 'Edit Blog' : 'Manage Blogs'}
                    </h2>
                    {loading && (
                        <div className="flex items-center justify-center gap-2 text-gray-600 mb-4">
                            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                            </svg>
                            <p>Loading...</p>
                        </div>
                    )}
                    {error && (
                        <p className="text-red-500 bg-red-50 p-3 rounded-lg mb-4 animate-pulse">{error}</p>
                    )}
                    {message && (
                        <p className="text-green-600 bg-green-50 p-3 rounded-lg mb-4 animate-fade-in">{message}</p>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <select
                            name="language"
                            value={form.language}
                            onChange={handleChange}
                            className="p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full bg-gray-50 text-gray-700 transition-shadow duration-200 hover:shadow-md"
                        >
                            <option value="ar">العربية</option>
                            <option value="en">English</option>
                        </select>
                        <input
                            name="title"
                            placeholder="Title"
                            value={form.title}
                            onChange={handleChange}
                            className="p-3 border border-gray-200 rounded-lg w-full bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-200 hover:shadow-md"
                        />
                        <textarea
                            name="description"
                            placeholder="Short Description"
                            value={form.description}
                            onChange={handleChange}
                            className="p-3 border border-gray-200 rounded-lg w-full bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-200 hover:shadow-md"
                            rows="3"
                        />
                        {/* <label className="block text-gray-700 text-sm font-bold mb-2 mt-4">Content:</label>
                        <ReactQuill
                            theme="snow"
                            value={form.content}
                            onChange={handleQuillChange}
                            modules={modules}
                            formats={formats}
                            className="bg-gray-50 rounded-lg shadow-md mb-4"
                        /> */}
                        <label className="block text-gray-700 text-sm font-bold mb-2 mt-4">Main Image (Optional):</label>
                        <input
                            type="file"
                            name="image"
                            onChange={handleFileChange}
                            className="p-3 border border-gray-200 rounded-lg w-full bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-200 hover:shadow-md"
                            accept="image/*"
                        />
                        {(currentImageUrl || imageFile) && (
                            <div className="mt-3">
                                <p className="text-sm text-gray-600">Current/Selected Image:</p>
                                <img
                                    src={imageFile ? URL.createObjectURL(imageFile) : currentImageUrl}
                                    alt="Image Preview"
                                    className="w-48 h-auto object-cover rounded-md border border-gray-200"
                                    onError={(e) => handleImageError(e, `main_form_image`, imageFile ? imageFile.name : currentImageUrl)}
                                />
                                {currentImageUrl && !imageFile && (
                                    <button
                                        type="button"
                                        onClick={handleRemoveMainImage}
                                        className="mt-2 bg-red-500 hover:bg-red-600 text-white text-sm py-1 px-3 rounded-md"
                                    >
                                        Remove Main Image
                                    </button>
                                )}
                            </div>
                        )}
                        <label className="block text-gray-700 text-sm font-bold mb-2 mt-4">Additional Images (Multi-select, Optional):</label>
                        <input
                            type="file"
                            name="additionalImages"
                            onChange={handleAdditionalFilesChange}
                            className="p-3 border border-gray-200 rounded-lg w-full bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-200 hover:shadow-md"
                            accept="image/*"
                            multiple
                        />
                        {(existingAdditionalImageUrls.length > 0 || additionalImageFiles.length > 0) && (
                            <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {existingAdditionalImageUrls.map((imageUrl, index) => (
                                    <div key={`existing-${index}`} className="relative group">
                                        <img
                                            src={imageUrl}
                                            alt={`Additional Image ${index}`}
                                            className="w-full h-24 object-cover rounded-lg shadow-sm"
                                            onError={(e) => handleImageError(e, `existing_add_image_${index}`, imageUrl)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveAdditionalImage(index)}
                                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Remove this image"
                                        >
                                            <svg
                                                className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                                xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                                {additionalImageFiles.map((file, index) => (
                                    <div key={`new-${index}`} className="relative group">
                                        <img
                                            src={URL.createObjectURL(file)}
                                            alt={`New Additional Image ${index}`}
                                            className="w-full h-24 object-cover rounded-lg shadow-sm"
                                            onError={(e) => handleImageError(e, `new_add_image_${index}`, file.name)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setAdditionalImageFiles((prev) => prev.filter((_, i) => i !== index));
                                            }}
                                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Remove this image"
                                        >
                                            <svg
                                                className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                                xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {/* <input
                            name="author"
                            placeholder="Author"
                            value={form.author}
                            onChange={handleChange}
                            className="p-3 border border-gray-200 rounded-lg w-full bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-200 hover:shadow-md"
                        /> */}
                        {/* Author field is optional */}
                        {/* <input
                            name="category"
                            placeholder="Category"
                            value={form.category}
                            onChange={handleChange}
                            className="p-3 border border-gray-200 rounded-lg w-full bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-200 hover:shadow-md"
                        /> */}
                        {/* Category field is optional */}
                        <input
                            name="date"
                            type="date"
                            value={form.date}
                            onChange={handleChange}
                            className="p-3 border border-gray-200 rounded-lg w-full bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-200 hover:shadow-md"
                        />
                        <button
                            type="submit"
                            className={`py-3 px-6 rounded-lg w-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg
                                ${editingBlogId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'} text-white`}
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                    <span>{editingBlogId ? 'Updating...' : 'Adding...'}</span>
                                </div>
                            ) : (
                                editingBlogId ? 'Update' : 'Add'
                            )}
                        </button>
                        {editingBlogId && (
                            <button
                                type="button"
                                onClick={handleCancelEdit}
                                className="bg-gray-400 text-white py-3 px-6 rounded-lg w-full mt-2 hover:bg-gray-500 transition-colors duration-200 shadow-md"
                                disabled={loading}
                            >
                                Cancel Edit
                            </button>
                        )}
                    </form>

                    <hr className="my-6 border-gray-200" />

                    <ul className="space-y-4">
                        {blogs.length === 0 && !error && !loading ? (
                            <p className="text-gray-600 text-center">No blogs available</p>
                        ) : (
                            blogs.map((blog) => (
                                <li
                                    key={blog.id}
                                    className="border border-gray-200 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                                >
                                    <div className="w-full sm:w-3/4 mb-4 sm:mb-0">
                                        <h3 className="text-lg font-semibold text-gray-800">{blog.title}</h3>
                                        {/* <p className="text-gray-600 text-sm">
                                            {blog.author || 'Admin'} • {blog.category || 'Uncategorized'} • {blog.date}
                                        </p> */}
                                        <p className="text-gray-700">{blog.description}</p>
                                        {blog.additional_images && blog.additional_images.length > 0 && (
                                            <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                {blog.additional_images.map((imageUrl, index) => (
                                                    <img
                                                        key={`blog-${blog.id}-additional-${index}`}
                                                        src={imageUrl}
                                                        alt={`Additional Image ${index + 1} for ${blog.title}`}
                                                        className="w-full h-24 object-cover rounded-lg shadow-sm"
                                                        loading="lazy"
                                                        onError={(e) => handleImageError(e, `blog_add_image_${blog.id}_${index}`, imageUrl)}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    {blog.image && (
                                        <img
                                            src={blog.image}
                                            alt={`${blog.title} Image`}
                                            className="w-24 h-24 object-cover rounded flex-shrink-0 mb-4 sm:mb-0 sm:ml-4"
                                            loading="lazy"
                                            onError={(e) => handleImageError(e, `blog_main_image_${blog.id}`, blog.image)}
                                        />
                                    )}
                                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-center sm:items-start">
                                        <button
                                            onClick={() => handleEdit(blog)}
                                            className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors duration-200 text-sm"
                                            disabled={loading}
                                        >
                                            ✏️ Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(blog.id)}
                                            className="text-red-600 hover:text-red-700 font-medium transition-colors duration-200 py-2 px-4 text-sm"
                                            disabled={loading}
                                        >
                                            🗑 Delete
                                        </button>
                                    </div>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AdminBlogs;