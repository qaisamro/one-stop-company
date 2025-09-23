import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSpinner, FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import '../css/Gallery.css'; // تأكد من إنشاء هذا الملف

const GalleryPage = () => {
    const { t, i18n } = useTranslation('translation');
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);
    const [error, setError] = useState('');
    
    // حالة التقسيم إلى صفحات
    const [currentPage, setCurrentPage] = useState(1);
    const [imagesPerPage] = useState(10);

    const API_URL = process.env.REACT_APP_API_URL || 'https://one-stop.ps';
    const token = localStorage.getItem('token');

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

    useEffect(() => {
        fetchImages();
    }, []);

    const openModal = (image) => {
        setSelectedImage(image);
    };

    const closeModal = () => {
        setSelectedImage(null);
    };

    // حساب الصور للصفحة الحالية
    const indexOfLastImage = currentPage * imagesPerPage;
    const indexOfFirstImage = indexOfLastImage - imagesPerPage;
    const currentImages = images.slice(indexOfFirstImage, indexOfLastImage);

    // تغيير الصفحة
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // الصفحة التالية
    const nextPage = () => {
        if (currentPage < Math.ceil(images.length / imagesPerPage)) {
            setCurrentPage(currentPage + 1);
        }
    };

    // الصفحة السابقة
    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    // إنشاء أرقام الصفحات
    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(images.length / imagesPerPage); i++) {
        pageNumbers.push(i);
    }

    // عرض مجموعة صغيرة من أرقام الصفحات حول الصفحة الحالية
    const getDisplayedPageNumbers = () => {
        const totalPages = Math.ceil(images.length / imagesPerPage);
        const delta = 2; // عدد الصفحات المعروضة على جانبي الصفحة الحالية
        const range = [];
        
        for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
            range.push(i);
        }
        
        if (currentPage - delta > 2) {
            range.unshift('...');
        }
        if (currentPage + delta < totalPages - 1) {
            range.push('...');
        }
        
        range.unshift(1);
        if (totalPages > 1) {
            range.push(totalPages);
        }
        
        return range;
    };

    return (
        <div className="gallery-container">
            {error && <div className="error-message">{error}</div>}

            <div className="gallery-header">
                <h1 className="gallery-title">{t('gallery.page_title')}</h1>
            </div>

            <div className="gallery-grid-wrapper">
                {loading ? (
                    <div className="loading-spinner">
                        <FaSpinner className="animate-spin" />
                    </div>
                ) : images.length > 0 ? (
                    <>
                        <div className="gallery-grid">
                            {currentImages.map((image) => (
                                <div
                                    key={image.id}
                                    className="gallery-item"
                                    onClick={() => openModal(image)}
                                >
                                    <img
                                        src={image.path}
                                        alt="Gallery"
                                        className="gallery-image"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            console.error(`Failed to load image: ${image.path}`);
                                        }}
                                    />
                                    <div className="overlay-effect"></div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination Controls */}
                        {images.length > imagesPerPage && (
                            <div className="pagination-container">
                                <div className="pagination-info">
                                    {t('gallery.showing')} {indexOfFirstImage + 1}-{Math.min(indexOfLastImage, images.length)} {t('gallery.of')} {images.length} {t('gallery.images')}
                                </div>
                                
                                <nav className="pagination-nav">
                                    <button 
                                        className={`pagination-btn ${currentPage === 1 ? 'disabled' : ''}`}
                                        onClick={prevPage}
                                        disabled={currentPage === 1}
                                    >
                                        <FaChevronLeft />
                                    </button>

                                    <div className="pagination-numbers">
                                        {getDisplayedPageNumbers().map((number, index) => (
                                            number === '...' ? (
                                                <span key={`ellipsis-${index}`} className="pagination-ellipsis">...</span>
                                            ) : (
                                                <button
                                                    key={number}
                                                    className={`pagination-number ${currentPage === number ? 'active' : ''}`}
                                                    onClick={() => paginate(number)}
                                                >
                                                    {number}
                                                </button>
                                            )
                                        ))}
                                    </div>

                                    <button 
                                        className={`pagination-btn ${currentPage === pageNumbers.length ? 'disabled' : ''}`}
                                        onClick={nextPage}
                                        disabled={currentPage === pageNumbers.length}
                                    >
                                        <FaChevronRight />
                                    </button>
                                </nav>
                            </div>
                        )}
                    </>
                ) : (
                    <p className="no-images-message">{t('gallery.no_images')}</p>
                )}
            </div>

            {selectedImage && (
                <div className="modal-backdrop" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={closeModal}>
                            <FaTimes />
                        </button>
                        <img src={selectedImage.path} alt="Enlarged" className="modal-image" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default GalleryPage;