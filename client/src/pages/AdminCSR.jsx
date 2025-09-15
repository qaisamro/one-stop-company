import React, { useState, useEffect, useRef } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { axiosInstance } from '../api/axiosConfig';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const AdminCSR = () => {
    const [currentLanguage, setCurrentLanguage] = useState('ar');
    const [csrItems, setCsrItems] = useState([]);
    const [currentCsrForm, setCurrentCsrForm] = useState({
        id: null,
        title_ar: '',
        title_en: '',
        paragraph_ar: '',
        paragraph_en: '',
        description_ar: '',
        description_en: '',
        image: null,
        additional_images: []
    });
    const [loading, setLoading] = useState(false);
    const [newMainImageFile, setNewMainImageFile] = useState(null);
    const [newAdditionalImages, setNewAdditionalImages] = useState([]);
    const [editingCsrId, setEditingCsrId] = useState(null);
    const mainImageInputRef = useRef(null);
    const additionalImagesInputRef = useRef(null);

    const BACKEND_URL = 'https://one-stop.ps';

    // State for managing the fixed paragraph separately
    const [fixedParagraph, setFixedParagraph] = useState({
        paragraph_ar: '',
        paragraph_en: ''
    });

    // Function to fetch all CSR items
    const fetchCsrContent = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/api/csr');
            if (response.data && Array.isArray(response.data)) {
                const fetchedItems = response.data.map(item => ({
                    id: item.id,
                    title_ar: item.title_ar || '',
                    title_en: item.title_en || '',
                    description_ar: item.description_ar || '',
                    description_en: item.description_en || '',
                    image: item.image || null,
                    additional_images: item.additional_images || []
                }));
                setCsrItems(fetchedItems);
            } else {
                setCsrItems([]);
            }
        } catch (error) {
            toast.error('فشل في جلب بيانات المسؤولية المجتمعية.');
            console.error('Fetch CSR content error:', error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    };

    // Function to fetch the fixed paragraph
    // Function to fetch the fixed paragraph
const fetchFixedParagraph = async () => {
    try {
        const response = await axiosInstance.get('/api/csr/fixed-paragraph');
        if (response.data) {
            setFixedParagraph({
                paragraph_ar: response.data.paragraph_ar || '',
                paragraph_en: response.data.paragraph_en || ''
            });
            // Also set it in the form for editing
            setCurrentCsrForm(prev => ({
                ...prev,
                paragraph_ar: response.data.paragraph_ar || '',
                paragraph_en: response.data.paragraph_en || ''
            }));
        }
    } catch (error) {
        console.error('Error fetching fixed paragraph:', error);
    }
};

    useEffect(() => {
        fetchCsrContent();
        fetchFixedParagraph();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentCsrForm(prevForm => ({
            ...prevForm,
            [name]: value
        }));
    };

    const handleQuillChange = (name, value) => {
        setCurrentCsrForm(prevForm => ({
            ...prevForm,
            [name]: value
        }));
    };

    const handleMainImageChange = (e) => {
        if (e.target.files[0]) {
            setNewMainImageFile(e.target.files[0]);
            setCurrentCsrForm(prevForm => ({ ...prevForm, image: URL.createObjectURL(e.target.files[0]) }));
        }
    };

    const handleAdditionalImagesChange = (e) => {
        const files = Array.from(e.target.files);
        setNewAdditionalImages(prev => [...prev, ...files]);
    };

    // Submit handler for the form (Add or Update)
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (
            !currentCsrForm.title_ar || !currentCsrForm.title_en ||
            !currentCsrForm.description_ar || !currentCsrForm.description_en
        ) {
            toast.error('جميع الحقول الرئيسية (العنوان والوصف) مطلوبة في كلتا اللغتين.');
            return;
        }

        setLoading(true);
        const formData = new FormData();

        // Append form data
        formData.append('title_ar', currentCsrForm.title_ar);
        formData.append('title_en', currentCsrForm.title_en);
        formData.append('description_ar', currentCsrForm.description_ar);
        formData.append('description_en', currentCsrForm.description_en);

        // Append new main image if selected
        if (newMainImageFile) {
            formData.append('image', newMainImageFile);
        }

        // Append new additional images
        newAdditionalImages.forEach(file => {
            formData.append('additional_images[]', file);
        });

        // If we are editing an existing item, append its ID and potentially existing images
        if (currentCsrForm.id) {
            formData.append('_method', 'PUT');
            currentCsrForm.additional_images.forEach(imageUrl => {
                formData.append('existing_additional_images[]', imageUrl);
            });
        }

        try {
            const url = currentCsrForm.id ? `/api/csr/${currentCsrForm.id}` : '/api/csr';
            const method = 'post';

            const response = await axiosInstance[method](url, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            toast.success(response.data.message || 'تم حفظ المحتوى بنجاح! ✅');
            resetFormState();
            await fetchCsrContent();

        } catch (error) {
            const errorMessage = error.response?.data?.error || error.response?.data?.details || 'حدث خطأ أثناء حفظ البيانات.';
            toast.error(errorMessage);
            console.error('Error saving CSR content:', error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    };

    // Function to save the fixed paragraph
    const handleSaveFixedParagraph = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.post('/api/csr/fixed-paragraph', {
                paragraph_ar: currentCsrForm.paragraph_ar,
                paragraph_en: currentCsrForm.paragraph_en
            });

            toast.success(response.data.message || 'تم حفظ الفقرة الثابتة بنجاح! ✅');
            setFixedParagraph({
                paragraph_ar: currentCsrForm.paragraph_ar,
                paragraph_en: currentCsrForm.paragraph_en
            });
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'حدث خطأ أثناء حفظ الفقرة الثابتة.';
            toast.error(errorMessage);
            console.error('Error saving fixed paragraph:', error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    };

    // Function to reset the form and temporary file states
    const resetFormState = () => {
        setCurrentCsrForm({
            id: null,
            title_ar: '',
            title_en: '',
            description_ar: '',
            description_en: '',
            image: null,
            additional_images: []
        });
        setNewMainImageFile(null);
        setNewAdditionalImages([]);
        if (mainImageInputRef.current) mainImageInputRef.current.value = '';
        if (additionalImagesInputRef.current) additionalImagesInputRef.current.value = '';
        setEditingCsrId(null);
    };

    // Function to load an existing CSR item into the form for editing
    const handleEditClick = (item) => {
        setCurrentCsrForm({
            id: item.id,
            title_ar: item.title_ar,
            title_en: item.title_en,
            description_ar: item.description_ar,
            description_en: item.description_en,
            image: item.image,
            additional_images: item.additional_images || []
        });
        setEditingCsrId(item.id);
        setNewMainImageFile(null);
        setNewAdditionalImages([]);
        if (mainImageInputRef.current) mainImageInputRef.current.value = '';
        if (additionalImagesInputRef.current) additionalImagesInputRef.current.value = '';
    };

    // Function to delete a CSR item
    const handleDeleteCsrItem = async (id) => {
        if (!window.confirm('هل أنت متأكد أنك تريد حذف هذا العنصر؟')) return;

        setLoading(true);
        try {
            await axiosInstance.delete(`/api/csr/${id}`);
            toast.success('تم حذف المحتوى بنجاح! ✅');
            await fetchCsrContent();
            if (editingCsrId === id) {
                resetFormState();
            }
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'فشل في حذف المحتوى.';
            toast.error(errorMessage);
            console.error('Error deleting CSR item:', error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    };

    // Functions to delete individual images
    const handleDeleteMainImage = async () => {
        if (!currentCsrForm.id || !currentCsrForm.image) {
            toast.error('لا توجد صورة رئيسية مرتبطة بهذا العنصر للحذف.');
            return;
        }

        setLoading(true);
        try {
            await axiosInstance.delete(`/api/csr/image/${currentCsrForm.id}`, {
                data: { image_path: currentCsrForm.image, type: 'main' }
            });
            toast.success('تم حذف الصورة الرئيسية بنجاح! ✅');
            setCurrentCsrForm(prev => ({ ...prev, image: null }));
            setNewMainImageFile(null);
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'فشل في حذف الصورة الرئيسية.';
            toast.error(errorMessage);
            console.error('Error deleting main image:', error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAdditionalImage = async (imageUrlToDelete) => {
        if (!currentCsrForm.id) {
            toast.error('لا يوجد سجل لتحديثه.');
            return;
        }

        setLoading(true);
        try {
            await axiosInstance.delete(`/api/csr/image/${currentCsrForm.id}`, {
                data: { image_path: imageUrlToDelete, type: 'additional' }
            });
            toast.success('تم حذف الصورة الإضافية بنجاح! ✅');
            setCurrentCsrForm(prev => ({
                ...prev,
                additional_images: prev.additional_images.filter(url => url !== imageUrlToDelete)
            }));
            setNewAdditionalImages(prev => prev.filter(file => file.name !== imageUrlToDelete.split('/').pop()));
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'فشل في حذف الصورة الإضافية.';
            toast.error(errorMessage);
            console.error('Error deleting additional image:', error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    };

    const modules = {
        toolbar: [
            [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'align': [] }],
            ['link', 'image'],
            ['clean']
        ],
    };

    const formats = [
        'header', 'font', 'list', 'bold', 'italic', 'underline', 'strike', 'blockquote', 'color', 'background', 'align', 'link', 'image'
    ];

    // Component to render form fields for a specific language
    const renderFormFields = (lang) => {
        const isArabic = lang === 'ar';
        const titleLabel = isArabic ? 'عنوان الصفحة (العربية)' : 'Page Title (English)';
        const descLabel = isArabic ? 'الوصف (العربية)' : 'Description (English)';

        return (
            <div dir={isArabic ? "rtl" : "ltr"}>
                <div className="mb-4">
                    <label className="block text-gray-700 text-lg font-semibold mb-2" htmlFor={`title_${lang}`}>
                        {titleLabel}
                    </label>
                    <input
                        type="text"
                        id={`title_${lang}`}
                        name={`title_${lang}`}
                        value={currentCsrForm[`title_${lang}`] || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-lg font-semibold mb-2" htmlFor={`description_${lang}`}>
                        {descLabel}
                    </label>
                    <textarea
                        id={`description_${lang}`}
                        name={`description_${lang}`}
                        value={currentCsrForm[`description_${lang}`] || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="3"
                        required
                    />
                </div>
            </div>
        );
    };

    // Component to render fixed paragraph editor
    const renderFixedParagraphEditor = () => {
        const isArabic = currentLanguage === 'ar';
        const paragraphLabel = isArabic ? 'الفقرة الثابتة (العربية)' : 'Fixed Paragraph (English)';

        return (
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">إدارة الفقرة الثابتة</h2>
                
                <div className="flex justify-center mb-6">
                    <button
                        type="button"
                        onClick={() => setCurrentLanguage('ar')}
                        className={`py-2 px-4 rounded-r-lg text-lg font-bold transition-colors ${currentLanguage === 'ar' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                    >
                        العربية
                    </button>
                    <button
                        type="button"
                        onClick={() => setCurrentLanguage('en')}
                        className={`py-2 px-4 rounded-l-lg text-lg font-bold transition-colors ${currentLanguage === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                    >
                        English
                    </button>
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-lg font-semibold mb-2">
                        {paragraphLabel}
                    </label>
                    <ReactQuill
                        theme="snow"
                        value={currentCsrForm[`paragraph_${currentLanguage}`] || ''}
                        onChange={(content) => handleQuillChange(`paragraph_${currentLanguage}`, content)}
                        modules={modules}
                        formats={formats}
                        className="w-full mb-4"
                    />
                </div>

                <button
                    type="button"
                    onClick={handleSaveFixedParagraph}
                    className="w-full py-3 px-4 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-gray-400"
                    disabled={loading}
                >
                    {loading ? 'جاري الحفظ...' : 'حفظ الفقرة الثابتة'}
                </button>
            </div>
        );
    };

    return (
        <div className="container mx-auto p-4 sm:p-6 md:p-8" dir="rtl">
            <ToastContainer position="bottom-right" theme="colored" />
            <h1 className="text-3xl font-bold text-gray-800 mb-6">إدارة محتوى المسؤولية المجتمعية</h1>

            {loading && !csrItems.length && (
                <div className="text-center p-4">
                    <p className="text-gray-500">جاري تحميل البيانات...</p>
                </div>
            )}

            {/* Fixed Paragraph Editor */}
            {renderFixedParagraphEditor()}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Form Section */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">{currentCsrForm.id ? 'تعديل محتوى CSR' : 'إضافة محتوى CSR جديد'}</h2>
                    <form onSubmit={handleSubmit}>
                        {/* Language Toggler */}
                        <div className="flex justify-center mb-6">
                            <button
                                type="button"
                                onClick={() => setCurrentLanguage('ar')}
                                className={`py-2 px-4 rounded-r-lg text-lg font-bold transition-colors ${currentLanguage === 'ar' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                            >
                                العربية
                            </button>
                            <button
                                type="button"
                                onClick={() => setCurrentLanguage('en')}
                                className={`py-2 px-4 rounded-l-lg text-lg font-bold transition-colors ${currentLanguage === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                            >
                                English
                            </button>
                        </div>

                        {/* Language-specific Forms */}
                        {currentLanguage === 'ar' && renderFormFields('ar')}
                        {currentLanguage === 'en' && renderFormFields('en')}

                        {/* Image Handling Section */}
                        <div className="mt-8">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">الصور</h3>

                            {/* Main Image */}
                            <div className="mb-6">
                                <label className="block text-gray-700 text-lg font-semibold mb-2" htmlFor="main_image">
                                    الصورة الرئيسية
                                </label>
                                {(currentCsrForm.image && !newMainImageFile) && (
                                    <div className="relative w-48 h-48 mb-4 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                                        <img src={`${BACKEND_URL}/${currentCsrForm.image}`} alt="CSR Main" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={handleDeleteMainImage}
                                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors"
                                            aria-label="حذف الصورة الرئيسية"
                                            disabled={loading}
                                        >
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm6 0a1 1 0 112 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
                                        </button>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    id="main_image"
                                    name="image"
                                    accept="image/*"
                                    onChange={handleMainImageChange}
                                    ref={mainImageInputRef}
                                    className="w-full text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    disabled={loading || (currentCsrForm.image && !newMainImageFile)}
                                />
                                {newMainImageFile && <p className="text-sm text-gray-500 mt-2">صورة جديدة مختارة: {newMainImageFile.name}</p>}
                            </div>

                            {/* Additional Images */}
                            <div className="mb-6">
                                <label className="block text-gray-700 text-lg font-semibold mb-2" htmlFor="additional_images">
                                    الصور الإضافية
                                </label>
                                <div className="flex flex-wrap gap-4 mb-4">
                                    {Array.isArray(currentCsrForm.additional_images) && currentCsrForm.additional_images.map((imageUrl, index) => (
                                        <div key={imageUrl || index} className="relative w-32 h-32 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                                            <img
                                                src={`${BACKEND_URL}/${imageUrl}`}
                                                alt="Additional CSR"
                                                className="w-full h-full object-cover"
                                                onError={(e) => { e.target.style.display = 'none'; console.error(`Failed to load image: ${BACKEND_URL}/${imageUrl}`); }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteAdditionalImage(imageUrl)}
                                                className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors"
                                                aria-label="حذف الصورة الإضافية"
                                                disabled={loading}
                                            >
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm6 0a1 1 0 112 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
                                            </button>
                                        </div>
                                    ))}
                                    {newAdditionalImages.map((file, index) => (
                                        <div key={`new_${index}`} className="relative w-32 h-32 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                                            <img src={URL.createObjectURL(file)} alt="New Additional CSR" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setNewAdditionalImages(prev => prev.filter((_, i) => i !== index));
                                                }}
                                                className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors"
                                                aria-label="إزالة الصورة الجديدة"
                                            >
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm6 0a1 1 0 112 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <input
                                    type="file"
                                    id="additional_images"
                                    name="additional_images"
                                    accept="image/*"
                                    onChange={handleAdditionalImagesChange}
                                    multiple
                                    ref={additionalImagesInputRef}
                                    className="w-full text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400"
                            disabled={loading}
                        >
                            {loading ? 'جاري الحفظ...' : (currentCsrForm.id ? 'تحديث المحتوى' : 'إضافة المحتوى')}
                        </button>

                        {currentCsrForm.id && (
                            <button
                                type="button"
                                onClick={resetFormState}
                                className="w-full py-3 px-4 mt-4 bg-gray-400 text-white font-semibold rounded-lg shadow-md hover:bg-gray-500 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                            >
                                إلغاء التعديل
                            </button>
                        )}
                    </form>
                </div>

                {/* List of CSR Items Section */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">محتويات المسؤولية المجتمعية الحالية</h2>
                    {loading && csrItems.length === 0 ? (
                         <p className="text-gray-500">جاري تحميل القائمة...</p>
                    ) : csrItems.length === 0 ? (
                        <p className="text-gray-500">لا يوجد محتوى مسؤولية مجتمعية مضاف حاليًا.</p>
                    ) : (
                        csrItems.map((item) => (
                            <div key={item.id} className="border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
                                <h3 className="text-lg font-semibold text-blue-700 mb-2">{item.title_ar || item.title_en}</h3>
                                <p className="text-gray-600 mb-2">
                                    {item.description_ar.substring(0, 100)}...
                                </p>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleEditClick(item)}
                                        className="py-1 px-3 bg-yellow-500 text-white font-medium rounded-md hover:bg-yellow-600 transition-colors"
                                        disabled={loading}
                                    >
                                        تعديل
                                    </button>
                                    <button
                                        onClick={() => handleDeleteCsrItem(item.id)}
                                        className="py-1 px-3 bg-red-500 text-white font-medium rounded-md hover:bg-red-600 transition-colors"
                                        disabled={loading}
                                    >
                                        حذف
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminCSR;