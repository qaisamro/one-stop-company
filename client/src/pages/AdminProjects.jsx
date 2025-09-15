import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { axiosInstance } from '../api/axiosConfig';

const AdminProjects = () => {
    const { t, i18n } = useTranslation();
    const [projects, setProjects] = useState([]);
    const [form, setForm] = useState({
        id: null,
        title: '',
        extra_title: '',
        title_description: '',
        description: '',
        detailed_description: '',
        image: null,
        additional_images: [],
        url: '',
        language: 'ar', // Set Arabic as default language
        sections: []
    });
    const [previewImage, setPreviewImage] = useState(null);
    const [previewAdditionalImages, setPreviewAdditionalImages] = useState([]);
    const [existingMainImageUrl, setExistingMainImageUrl] = useState(null);
    const [existingAdditionalImageUrls, setExistingAdditionalImageUrls] = useState([]);
    const [backgroundImageFile, setBackgroundImageFile] = useState(null);
    const [currentBackgroundImage, setCurrentBackgroundImage] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const sidebarRef = useRef(null);
    const navigate = useNavigate();

    // Refs for file inputs
    const mainImageInputRef = useRef(null);
    const additionalImagesInputRef = useRef(null);
    const backgroundImageInputRef = useRef(null);

    useEffect(() => {
        // Ensure language is set to Arabic
        i18n.changeLanguage('ar');
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/admin/login');
        } else {
            fetchProjects(form.language);
            fetchProjectBackground();
        }
    }, [form.language, navigate, i18n]);

    const fetchProjects = async (lang) => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(`/api/projects?lang=${lang}`);
            setProjects(response.data);
            setError('');
        } catch (err) {
            const errorMessage = err.response?.data?.error || t('errors.fetchProjectsError');
            setError(errorMessage);
            console.error('Fetch projects error:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchProjectBackground = async () => {
        try {
            const response = await axiosInstance.get('/api/projects/background');
            setCurrentBackgroundImage(response.data.imagePath || '');
        } catch (err) {
            const errorMessage = err.response?.data?.error || t('errors.fetchBackgroundError');
            setError(errorMessage);
            console.error('Error fetching project background:', err);
        }
    };

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'image') {
            setForm({ ...form, image: files ? files[0] : null });
            setPreviewImage(files && files[0] ? URL.createObjectURL(files[0]) : null);
        } else if (name === 'additional_images') {
            setForm({ ...form, additional_images: files ? Array.from(files) : [] });
            setPreviewAdditionalImages(files ? Array.from(files).map(file => URL.createObjectURL(file)) : []);
        } else if (name === 'backgroundImage') {
            setBackgroundImageFile(files ? files[0] : null);
        } else {
            setForm({ ...form, [name]: value });
        }
    };

    const handleSectionChange = (index, field, value) => {
        const newSections = [...form.sections];
        newSections[index] = { ...newSections[index], [field]: value };
        setForm({ ...form, sections: newSections });
    };

    const addSection = () => {
        setForm({ ...form, sections: [...form.sections, { title: '', description: '' }] });
    };

    const removeSection = (index) => {
        setForm({ ...form, sections: form.sections.filter((_, i) => i !== index) });
    };

    const removeExistingAdditionalImage = (indexToRemove) => {
        setExistingAdditionalImageUrls(prevUrls => prevUrls.filter((_, index) => index !== indexToRemove));
    };

    const resetForm = () => {
        setForm({
            id: null,
            title: '',
            extra_title: '',
            title_description: '',
            description: '',
            detailed_description: '',
            image: null,
            additional_images: [],
            url: '',
            language: 'ar',
            sections: []
        });
        setPreviewImage(null);
        setPreviewAdditionalImages([]);
        setExistingMainImageUrl(null);
        setExistingAdditionalImageUrls([]);
        if (mainImageInputRef.current) mainImageInputRef.current.value = '';
        if (additionalImagesInputRef.current) additionalImagesInputRef.current.value = '';
    };

    const handleAdd = async () => {
        if (!form.title || !form.description || !form.language) {
            setError(t('errors.requiredFields'));
            return;
        }
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('title', form.title);
            formData.append('extra_title', form.extra_title || '');
            formData.append('title_description', form.title_description || '');
            formData.append('description', form.description);
            formData.append('detailed_description', form.detailed_description || '');
            formData.append('url', form.url || '');
            formData.append('language', form.language);
            if (form.image) {
                formData.append('image', form.image);
            }
            form.additional_images.forEach(file => {
                formData.append('additional_images[]', file);
            });
            formData.append('sections', JSON.stringify(form.sections));

            await axiosInstance.post('/api/projects', formData);
            setMessage(t('messages.addProjectSuccess'));
            setError('');
            resetForm();
            fetchProjects(form.language);
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.response?.data?.errors || t('errors.addProjectError');
            setError(errorMessage);
            console.error('Add project error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (project) => {
        setForm({
            id: project.id,
            title: project.title || '',
            extra_title: project.extra_title || '',
            title_description: project.title_description || '',
            description: project.description || '',
            detailed_description: project.detailed_description || '',
            image: null,
            additional_images: [],
            url: project.url || '',
            language: project.language || 'ar',
            sections: Array.isArray(project.sections) ? project.sections : []
        });
        setExistingMainImageUrl(project.image || null);
        setExistingAdditionalImageUrls(project.additional_images || []);
        setPreviewImage(null);
        setPreviewAdditionalImages([]);
        if (mainImageInputRef.current) mainImageInputRef.current.value = '';
        if (additionalImagesInputRef.current) additionalImagesInputRef.current.value = '';
    };

    const handleUpdate = async () => {
        if (!form.id || !form.title || !form.description || !form.language) {
            setError(t('errors.requiredFields'));
            return;
        }
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('title', form.title);
            formData.append('extra_title', form.extra_title || '');
            formData.append('title_description', form.title_description || '');
            formData.append('description', form.description);
            formData.append('detailed_description', form.detailed_description || '');
            formData.append('url', form.url || '');
            formData.append('language', form.language);
            if (form.image) {
                formData.append('image', form.image);
            }
            form.additional_images.forEach(file => {
                formData.append('additional_images[]', file);
            });
            formData.append('existing_additional_images', JSON.stringify(existingAdditionalImageUrls));
            formData.append('sections', JSON.stringify(form.sections));
            formData.append('_method', 'PUT');

            await axiosInstance.post(`/api/projects/${form.id}`, formData);
            setMessage(t('messages.updateProjectSuccess'));
            setError('');
            resetForm();
            fetchProjects(form.language);
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.response?.data?.errors || t('errors.updateProjectError');
            setError(errorMessage);
            console.error('Update project error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        setLoading(true);
        try {
            await axiosInstance.delete(`/api/projects/${id}?lang=${form.language}`);
            setMessage(t('messages.deleteProjectSuccess'));
            setError('');
            fetchProjects(form.language);
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            const errorMessage = err.response?.data?.error || t('errors.deleteProjectError');
            setError(errorMessage);
            console.error('Delete project error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProjectBackground = async () => {
        if (!backgroundImageFile) {
            setError(t('errors.backgroundImageRequired'));
            return;
        }
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('image', backgroundImageFile);
            await axiosInstance.post('/api/projects/background', formData);
            setMessage(t('messages.updateBackgroundSuccess'));
            setError('');
            setBackgroundImageFile(null);
            if (backgroundImageInputRef.current) backgroundImageInputRef.current.value = '';
            fetchProjectBackground();
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            const errorMessage = err.response?.data?.error || t('errors.updateBackgroundError');
            setError(errorMessage);
            console.error('Update background image error:', err);
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
        <div className={`min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-row-reverse font-sans`} dir="rtl">
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
                    aria-label={t('sidebarToggle')}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

                <div className="bg-white shadow-xl p-6 sm:p-8 rounded-2xl w-full max-w-3xl mx-auto mb-8 transition-all duration-300">
                    <h2 className="text-3xl font-bold mb-6 text-gray-800 tracking-tight">{t('backgroundSectionTitle')}</h2>
                    {error && error.includes(t('errors.backgroundImageRequired')) && (
                        <p className="text-red-500 bg-red-50 p-3 rounded-lg mb-4 animate-pulse">{error}</p>
                    )}
                    {message && message.includes(t('messages.updateBackgroundSuccess')) && (
                        <p className="text-green-600 bg-green-50 p-3 rounded-lg mb-4 animate-fade-in">{message}</p>
                    )}

                    <div className="space-y-4 mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="backgroundImage">
                            {t('backgroundImageLabel')}
                        </label>
                        {currentBackgroundImage && (
                            <div className="mb-4">
                                <p className="text-gray-600 text-sm mb-2">{t('currentBackgroundImage')}</p>
                                <img
                                    src={currentBackgroundImage}
                                    alt={t('currentBackgroundImage')}
                                    className="w-full max-h-48 object-cover rounded-lg shadow-md"
                                />
                            </div>
                        )}
                        <input
                            type="file"
                            name="backgroundImage"
                            accept="image/*"
                            onChange={handleChange}
                            className="p-3 border border-gray-200 rounded-lg w-full bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-200 hover:shadow-md"
                            ref={backgroundImageInputRef}
                        />
                        <button
                            onClick={handleUpdateProjectBackground}
                            className="bg-purple-600 text-white py-3 px-6 rounded-lg w-full hover:bg-purple-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                            disabled={loading || !backgroundImageFile}
                        >
                            {loading && backgroundImageFile ? (
                                <div className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                    <span>{t('updatingBackground')}</span>
                                </div>
                            ) : (
                                t('updateBackgroundButton')
                            )}
                        </button>
                    </div>

                    <hr className="my-8 border-gray-300" />

                    <h2 className="text-3xl font-bold mb-6 text-gray-800 tracking-tight">{t('individualProjectsTitle')}</h2>
                    {error && !error.includes(t('errors.backgroundImageRequired')) && (
                        <p className="text-red-500 bg-red-50 p-3 rounded-lg mb-4 animate-pulse">{error}</p>
                    )}
                    {message && !message.includes(t('messages.updateBackgroundSuccess')) && (
                        <p className="text-green-600 bg-green-50 p-3 rounded-lg mb-4 animate-fade-in">{message}</p>
                    )}

                    <div className="space-y-4">
                        <select
                            name="language"
                            value={form.language}
                            onChange={handleChange}
                            className="p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full bg-gray-50 text-gray-700 transition-shadow duration-200 hover:shadow-md"
                        >
                            <option value="ar">{t('languageOptions.ar')}</option>
                            <option value="en">{t('languageOptions.en')}</option>
                        </select>
                        <input
                            name="title"
                            placeholder={t('titlePlaceholder')}
                            value={form.title}
                            onChange={handleChange}
                            className="p-3 border border-gray-200 rounded-lg w-full bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-200 hover:shadow-md"
                        />
                        <input
                            name="extra_title"
                            placeholder={t('extraTitlePlaceholder')}
                            value={form.extra_title}
                            onChange={handleChange}
                            className="p-3 border border-gray-200 rounded-lg w-full bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-200 hover:shadow-md"
                        />
                        <textarea
                            name="title_description"
                            placeholder={t('titleDescriptionPlaceholder')}
                            value={form.title_description}
                            onChange={handleChange}
                            className="p-3 border border-gray-200 rounded-lg w-full bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-200 hover:shadow-md"
                            rows="3"
                        />
                        <textarea
                            name="description"
                            placeholder={t('descriptionPlaceholder')}
                            value={form.description}
                            onChange={handleChange}
                            className="p-3 border border-gray-200 rounded-lg w-full bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-200 hover:shadow-md"
                            rows="5"
                        />
                        <textarea
                            name="detailed_description"
                            placeholder={t('detailedDescriptionPlaceholder')}
                            value={form.detailed_description}
                            onChange={handleChange}
                            className="p-3 border border-gray-200 rounded-lg w-full bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-200 hover:shadow-md"
                            rows="5"
                        />
                        <input
                            name="url"
                            placeholder={t('urlPlaceholder')}
                            value={form.url}
                            onChange={handleChange}
                            className="p-3 border border-gray-200 rounded-lg w-full bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-200 hover:shadow-md"
                        />

                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            {t('mainImageLabel')}
                        </label>
                        {existingMainImageUrl && (
                            <div className="mb-2">
                                <p className="text-gray-600 text-sm">{t('currentImage')}</p>
                                <img src={existingMainImageUrl} alt={t('currentImage')} className="w-24 h-24 object-cover rounded-md border border-gray-200" />
                            </div>
                        )}
                        {previewImage && (
                            <div className="mb-2">
                                <p className="text-gray-600 text-sm">{t('newImagePreview')}</p>
                                <img src={previewImage} alt={t('newImagePreview')} className="w-24 h-24 object-cover rounded-md border border-gray-200" />
                            </div>
                        )}
                        <input
                            type="file"
                            name="image"
                            accept="image/*"
                            onChange={handleChange}
                            className="p-3 border border-gray-200 rounded-lg w-full bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-200 hover:shadow-md"
                            ref={mainImageInputRef}
                        />

                        <label className="block text-gray-700 text-sm font-bold mb-2 mt-4">
                            {t('additionalImagesLabel')}
                        </label>
                        {existingAdditionalImageUrls.length > 0 && (
                            <div className="mb-2">
                                <p className="text-gray-600 text-sm">{t('currentAdditionalImages')}</p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {existingAdditionalImageUrls.map((img, index) => (
                                        <div key={`existing-${index}`} className="relative">
                                            <img src={img} alt={t('additionalImages')} className="w-24 h-24 object-cover rounded-md border border-gray-200" />
                                            <button
                                                type="button"
                                                onClick={() => removeExistingAdditionalImage(index)}
                                                className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs hover:bg-red-600 focus:outline-none"
                                                aria-label={t('removeImage')}
                                            >
                                                &times;
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {previewAdditionalImages.length > 0 && (
                            <div className="mb-2">
                                <p className="text-gray-600 text-sm">{t('newAdditionalImagesPreview')}</p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {previewAdditionalImages.map((img, index) => (
                                        <img key={`preview-${index}`} src={img} alt={t('newAdditionalImagesPreview')} className="w-24 h-24 object-cover rounded-md border border-gray-200" />
                                    ))}
                                </div>
                            </div>
                        )}
                        <input
                            type="file"
                            name="additional_images"
                            accept="image/*"
                            multiple
                            onChange={handleChange}
                            className="p-3 border border-gray-200 rounded-lg w-full bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-200 hover:shadow-md"
                            ref={additionalImagesInputRef}
                        />

                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800">{t('sectionsTitle')}</h3>
                            {form.sections.map((section, index) => (
                                <div key={index} className="border p-4 rounded-lg bg-gray-50">
                                    <input
                                        placeholder={t('sectionTitlePlaceholder')}
                                        value={section.title || ''}
                                        onChange={(e) => handleSectionChange(index, 'title', e.target.value)}
                                        className="p-3 border border-gray-200 rounded-lg w-full mb-2 bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <textarea
                                        placeholder={t('sectionDescriptionPlaceholder')}
                                        value={section.description || ''}
                                        onChange={(e) => handleSectionChange(index, 'description', e.target.value)}
                                        className="p-3 border border-gray-200 rounded-lg w-full bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows="3"
                                    />
                                    <button
                                        onClick={() => removeSection(index)}
                                        className="text-red-600 hover:text-red-700 font-medium mt-2"
                                    >
                                        {t('removeSectionButton')}
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={addSection}
                                className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors duration-200"
                            >
                                {t('addSectionButton')}
                            </button>
                        </div>
                        <button
                            onClick={form.id ? handleUpdate : handleAdd}
                            className="bg-blue-600 text-white py-3 px-6 rounded-lg w-full hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                            disabled={loading}
                        >
                            {loading && !backgroundImageFile ? (
                                <div className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                    <span>{form.id ? t('updatingProject') : t('addingProject')}</span>
                                </div>
                            ) : (
                                form.id ? t('updateProjectButton') : t('addProjectButton')
                            )}
                        </button>
                    </div>

                    <hr className="my-6 border-gray-200" />

                    <ul className="space-y-4">
                        {projects.length === 0 && !error && !loading ? (
                            <p className="text-gray-600 text-center">{t('noProjects')}</p>
                        ) : (
                            projects.map(project => (
                                <li
                                    key={`${project.id}-${form.language}`}
                                    className="border border-gray-200 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-800">{project.title}</h3>
                                            {project.extra_title && <p className="text-gray-600">{project.extra_title}</p>}
                                            {project.title_description && <p className="text-gray-600">{project.title_description}</p>}
                                            <p className="text-gray-600">{project.description}</p>
                                            {project.detailed_description && <p className="text-gray-600">{project.detailed_description}</p>}
                                            {project.url && (
                                                <a
                                                    href={project.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-blue-600 hover:text-blue-700 underline"
                                                >
                                                    {t('projectLink')}
                                                </a>
                                            )}
                                            {project.image && (
                                                <div className="mt-2">
                                                    <p className="text-gray-600 text-sm">{t('mainImage')}</p>
                                                    <img
                                                        src={project.image}
                                                        alt={project.title}
                                                        className="w-20 h-20 object-cover rounded"
                                                    />
                                                </div>
                                            )}
                                            {project.additional_images && project.additional_images.length > 0 && (
                                                <div className="mt-2">
                                                    <p className="text-gray-600 text-sm">{t('additionalImages')}</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {project.additional_images.map((img, index) => (
                                                            <img
                                                                key={index}
                                                                src={img}
                                                                alt={t('additionalImages')}
                                                                className="w-20 h-20 object-cover rounded"
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            {project.sections && project.sections.length > 0 && (
                                                <div className="mt-2">
                                                    <p className="text-gray-600 text-sm">{t('sections')}</p>
                                                    {project.sections.map((section, index) => (
                                                        <div key={index} className="mt-1">
                                                            <p className="font-semibold">{section.title}</p>
                                                            <p>{section.description}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(project)}
                                                className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                                                disabled={loading}
                                            >
                                                {t('editButton')}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(project.id)}
                                                className="text-red-600 hover:text-red-700 font-medium transition-colors duration-200"
                                                disabled={loading}
                                            >
                                                {t('deleteButton')}
                                            </button>
                                        </div>
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

export default AdminProjects;