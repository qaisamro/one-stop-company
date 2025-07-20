import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const AdminStory = () => {
    const { i18n, t } = useTranslation();
    const [story, setStory] = useState({ id: null, title: '', content: '', image_url: null, language: i18n.language });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');

    useEffect(() => {
        setLoading(true);
        axios
            .get(`${process.env.REACT_APP_API_URL}/api/story?lang=${i18n.language}`)
            .then((res) => {
                const fetchedStory = res.data || { id: null, title: '', content: '', image_url: null, language: i18n.language };
                setStory(fetchedStory);
                setImagePreview(fetchedStory.image_url || '');
                setLoading(false);
            })
            .catch((err) => {
                console.error('Error fetching story:', err);
                setStatus(t('failed_to_load_story', 'Failed to load story.'));
                setLoading(false);
            });
    }, [i18n.language, t]);

    const handleChange = (e) => {
        setStory({ ...story, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setSelectedFile(file);
        if (file) {
            setImagePreview(URL.createObjectURL(file));
        } else {
            setImagePreview(story.image_url || '');
        }
    };

    const handleSubmit = () => {
        setStatus(null);
        setLoading(true);
        const formData = new FormData();
        formData.append('title', story.title);
        formData.append('content', story.content);
        formData.append('language', i18n.language);
        if (selectedFile) {
            formData.append('image', selectedFile);
        }
        if (story.image_url && !selectedFile) {
            formData.append('image_url', story.image_url); // Send old image_url if no new file
        }

        const request = story.id
            ? axios.put(`${process.env.REACT_APP_API_URL}/api/story/${story.id}`, formData, {
                  headers: { 'Content-Type': 'multipart/form-data' },
              })
            : axios.post(`${process.env.REACT_APP_API_URL}/api/story`, formData, {
                  headers: { 'Content-Type': 'multipart/form-data' },
              });

        request
            .then((res) => {
                setStatus(t(story.id ? 'story_updated' : 'story_created', story.id ? '✅ Story updated successfully' : '✅ Story created successfully'));
                setStory(res.data);
                setImagePreview(res.data.image_url || '');
                setSelectedFile(null);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Error:', err);
                setStatus(t('error_saving', '❌ Error saving story'));
                setLoading(false);
            });
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-6">
                <label htmlFor="language" className="block mb-2 font-medium">
                    {t('select_language', 'Select Language')}:
                </label>
                <select
                    id="language"
                    value={i18n.language}
                    onChange={(e) => i18n.changeLanguage(e.target.value)}
                    className="p-2 border rounded w-full bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-it-turquoise"
                >
                    <option value="en">English</option>
                    <option value="ar">العربية</option>
                </select>
            </div>

            <h2 className="text-2xl font-bold mb-4 text-it-dark-blue">
                {t('edit_our_story', 'Edit Our Story Section')}
            </h2>

            {loading ? (
                <div className="flex items-center justify-center gap-4 text-it-dark-blue">
                    <svg className="animate-spin w-5 h-5 text-it-yellow" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    <p>{t('loading', 'Loading...')}</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <input
                        type="text"
                        name="title"
                        value={story.title}
                        onChange={handleChange}
                        placeholder={t('story_title_placeholder', 'Story Title')}
                        className="w-full p-3 border rounded bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-it-turquoise"
                    />
                    <textarea
                        name="content"
                        value={story.content}
                        onChange={handleChange}
                        rows={10}
                        placeholder={t('story_content_placeholder', 'Story Content')}
                        className="w-full p-3 border rounded resize-y bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-it-turquoise"
                    />
                    <div className="mb-4">
                        <label htmlFor="image" className="block mb-2 font-medium">
                            {t('story_image', 'Story Image')}:
                        </label>
                        <input
                            type="file"
                            id="image"
                            name="image"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="w-full p-3 border rounded bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-it-turquoise"
                        />
                        {imagePreview && (
                            <div className="mt-4">
                                <p className="mb-2">{t('image_preview', 'Image Preview')}:</p>
                                <img
                                    src={imagePreview}
                                    alt={t('story_image_alt', 'Story image preview')}
                                    className="max-w-xs h-auto border rounded shadow-md"
                                />
                            </div>
                        )}
                        {!imagePreview && story.image_url && (
                            <div className="mt-4">
                                <p className="mb-2">{t('current_image', 'Current Image')}:</p>
                                <img
                                    src={story.image_url}
                                    alt={t('story_image_alt', 'Current story image')}
                                    className="max-w-xs h-auto border rounded shadow-md"
                                />
                            </div>
                        )}
                        {!imagePreview && !story.image_url && (
                            <div className="mt-4 text-gray-500">
                                {t('no_image_available', 'No image available')}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-6 py-2 bg-it-dark-blue text-white rounded hover:bg-it-turquoise transition disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center gap-2">
                                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                                <span>{t('saving', 'Saving...')}</span>
                            </div>
                        ) : (
                            t('save', 'Save')
                        )}
                    </button>
                    {status && (
                        <p className={`mt-3 font-medium ${status.startsWith('✅') ? 'text-green-600' : 'text-red-600'}`}>
                            {status}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminStory;