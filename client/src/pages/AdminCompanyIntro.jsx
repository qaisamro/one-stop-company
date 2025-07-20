import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminCompanyIntro = () => {
    const [intro, setIntro] = useState({ title: '', description: [], images: [] });
    const [form, setForm] = useState({ title: '', descriptions: [''], image: null, language: 'ar' });
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const sidebarRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/admin/login');
        } else {
            fetchIntro();
        }
    }, [form.language, navigate]);

    const fetchIntro = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/company-intro?lang=${form.language}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            const fetchedDescriptions = Array.isArray(response.data.description)
                ? response.data.description
                : [];
            setIntro(response.data);
            setForm(prevForm => ({
                ...prevForm,
                title: response.data.title || '',
                descriptions: fetchedDescriptions.length > 0 ? fetchedDescriptions : [''],
            }));
            setError('');
        } catch (err) {
            console.error('Error fetching company intro:', err);
            if (err.response && err.response.data && err.response.data.error) {
                setError(`Failed to load company introduction: ${err.response.data.error}`);
            } else {
                setError('Failed to load company introduction.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e, index) => {
        if (e.target.name === 'image') {
            setForm({ ...form, image: e.target.files[0] });
        } else if (e.target.name === 'description') {
            const newDescriptions = [...form.descriptions];
            newDescriptions[index] = e.target.value;
            setForm({ ...form, descriptions: newDescriptions });
        } else {
            setForm({ ...form, [e.target.name]: e.target.value });
        }
    };

    const handleAddDescription = () => {
        setForm({ ...form, descriptions: [...form.descriptions, ''] });
    };

    const handleRemoveDescription = (index) => {
        if (form.descriptions.length === 1) {
            setError('يجب أن يحتوي الوصف على فقرة واحدة على الأقل.');
            return;
        }
        const newDescriptions = form.descriptions.filter((_, i) => i !== index);
        setForm({ ...form, descriptions: newDescriptions });
    };

    const handleAddImage = async () => {
        if (!form.image) {
            setError('Please select an image.');
            return;
        }
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('image', form.image);
            formData.append('language', form.language);
            await axios.post('${process.env.REACT_APP_API_URL}/api/company-intro/image', formData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            setMessage('Image added successfully! ✅');
            setError('');
            setForm({ ...form, image: null });
            fetchIntro();
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            console.error('Error adding image:', err);
            if (err.response && err.response.data && err.response.data.error) {
                setError(`Failed to add image: ${err.response.data.error}`);
            } else {
                setError('Failed to add image.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateContent = async () => {
        setLoading(true);
        const descriptionArrayToSend = form.descriptions
            .map(p => p.trim())
            .filter(p => p !== '');
        if (!form.title || descriptionArrayToSend.length === 0) {
            setError('Title and at least one description are required.');
            setLoading(false);
            return;
        }
        try {
            const response = await axios.put('${process.env.REACT_APP_API_URL}/api/company-intro', {
                title: form.title,
                description: descriptionArrayToSend,
                language: form.language,
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            setMessage(response.data.message + ' ✅');
            setError('');
            fetchIntro();
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            console.error('Error updating content:', err);
            if (err.response && err.response.data && err.response.data.error) {
                setError(`Failed to update content: ${err.response.data.error}`);
            } else {
                setError('Failed to update content.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteImage = async (index) => {
        setLoading(true);
        try {
            await axios.delete(`${process.env.REACT_APP_API_URL}/api/company-intro/image/${index}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                data: { language: form.language },
            });
            setMessage('Image deleted successfully! ✅');
            setError('');
            fetchIntro();
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            console.error('Error deleting image:', err);
            if (err.response && err.response.data && err.response.data.error) {
                setError(`Failed to delete image: ${err.response.data.error}`);
            } else {
                setError('Failed to delete image.');
            }
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

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-row-reverse font-sans">
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-60 md:hidden z-40 transition-opacity duration-300"
                    onClick={toggleSidebar}
                ></div>
            )}

            <div className="flex-1 p-4 sm:p-6 md:p-8">
                <button
                    onClick={toggleSidebar}
                    className="md:hidden mb-6 text-gray-700 focus:outline-none p-3 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                    aria-label="فتح الشريط الجانبي"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

                <div className="bg-white shadow-xl p-6 sm:p-8 rounded-2xl w-full max-w-3xl mx-auto transition-all duration-300">
                    <h2 className="text-3xl font-bold mb-6 text-gray-800 tracking-tight">Manage Company Introduction</h2>
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

                    <div className="space-y-4">
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
                            type="text"
                            name="title"
                            placeholder="Company Title"
                            value={form.title}
                            onChange={handleChange}
                            className="p-3 border border-gray-200 rounded-lg w-full bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-200 hover:shadow-md"
                        />

                        {form.descriptions.map((desc, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <textarea
                                    name="description"
                                    placeholder={`Description ${index + 1}`}
                                    value={desc}
                                    onChange={(e) => handleChange(e, index)}
                                    className="p-3 border border-gray-200 rounded-lg w-full bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-200 hover:shadow-md"
                                    rows="3"
                                />
                                {form.descriptions.length > 1 && (
                                    <button
                                        onClick={() => handleRemoveDescription(index)}
                                        className="text-red-600 hover:text-red-700 font-medium p-2 rounded-full hover:bg-red-50 transition-colors duration-200"
                                        disabled={loading}
                                    >
                                        🗑
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            onClick={handleAddDescription}
                            className="bg-gray-600 text-white py-2 px-4 rounded-lg w-full hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            Add Description
                        </button>
                        <button
                            onClick={handleUpdateContent}
                            className="bg-blue-600 text-white py-3 px-6 rounded-lg w-full hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                    <span>Updating...</span>
                                </div>
                            ) : (
                                'Update Content'
                            )}
                        </button>
                        <input
                            type="file"
                            name="image"
                            accept="image/*"
                            onChange={handleChange}
                            className="p-3 border border-gray-200 rounded-lg w-full bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-200 hover:shadow-md"
                        />
                        <button
                            onClick={handleAddImage}
                            className="bg-green-600 text-white py-3 px-6 rounded-lg w-full hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                    <span>Adding image...</span>
                                </div>
                            ) : (
                                'Add Image'
                            )}
                        </button>
                    </div>

                    <hr className="my-6 border-gray-200" />

                    <ul className="space-y-4">
                        {intro.images.length === 0 && !error && !loading ? (
                            <p className="text-gray-600 text-center">No images currently.</p>
                        ) : (
                            intro.images.map((image, index) => (
                                <li
                                    key={index}
                                    className="border border-gray-200 p-4 rounded-lg flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                                >
                                    <img src={image} alt={`Image ${index + 1}`} className="w-24 h-24 object-cover rounded" />
                                    <button
                                        onClick={() => handleDeleteImage(index)}
                                        className="text-red-600 hover:text-red-700 font-medium transition-colors duration-200"
                                        disabled={loading}
                                    >
                                        🗑 Delete
                                    </button>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AdminCompanyIntro;