import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

// Utility component for social media icons (remains the same functionality, but updated colors)
const SocialIcon = ({ platform, url }) => {
    let iconPath;
    let ariaLabel;
    let hoverColorClass; // Tailwind CSS class for hover color

    // Helper function to get platform from URL if not explicitly provided
    const getPlatformFromUrl = (url) => {
        if (!url) return null;
        if (url.includes('linkedin.com')) return 'linkedin';
        if (url.includes('twitter.com')) return 'twitter';
        if (url.includes('facebook.com')) return 'facebook';
        if (url.includes('instagram.com')) return 'instagram';
        if (url.includes('youtube.com')) return 'youtube';
        if (url.includes('github.com')) return 'github';
        if (url.includes('wa.me') || url.includes('whatsapp.com')) return 'whatsapp';
        if (url.includes('tiktok.com')) return 'tiktok';
        if (url.includes('snapchat.com')) return 'snapchat';
        if (url.includes('t.me') || url.includes('telegram.me')) return 'telegram';
        if (url.includes('behance.net')) return 'behance';
        if (url.includes('dribbble.com')) return 'dribbble';
        if (url.includes('pinterest.com')) return 'pinterest';
        if (url.includes('x.com')) return 'x';
        return 'website'; // Default to generic website icon
    };

    const resolvedPlatform = platform || getPlatformFromUrl(url);

    switch (resolvedPlatform) {
        case 'linkedin':
            iconPath = "M22.239 0H1.761C.787 0 0 .761 0 1.761v20.478C0 23.239.787 24 1.761 24h20.478c.974 0 1.761-.761 1.761-1.761V1.761C24 .761 23.213 0 22.239 0zM7.197 20.46H3.59V9.22H7.197v11.24zM5.399 7.718c-1.224 0-2.213-.99-2.213-2.214 0-1.224.989-2.213 2.213-2.213 1.224 0 2.213.989 2.213 2.213 0 1.224-.989 2.214-2.213 2.214zM20.46 20.46h-3.607v-5.803c0-1.38-.025-3.15-1.92-3.15-1.92 0-2.213 1.5-2.213 3.05v5.903H9.113V9.22h3.456v1.581h.05c.48-.916 1.65-1.876 3.404-1.876 3.64 0 4.314 2.39 4.314 5.5V20.46z";
            ariaLabel = "LinkedIn profile";
            hoverColorClass = "hover:text-blue-600";
            break;
        case 'twitter':
        case 'x':
            iconPath = "M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.791-1.574 2.162-2.722-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.729-.023-1.494-.223-2.24-.614-.047.607.173 1.25.64 1.846 1.268 1.637 3.29 2.502 5.393 2.502.262 0 .52-.026.772-.074-.741.233-1.44.37-2.18.37-1.42 0-2.75-.15-4.04-.44 1.767 1.492 3.993 2.36 6.353 2.36 7.678 0 11.92-6.321 11.65-12.207.78-.564 1.453-1.268 1.999-2.062z";
            ariaLabel = "Twitter profile";
            hoverColorClass = "hover:text-blue-400";
            break;
        case 'facebook':
            iconPath = "M22.675 0H1.325C.593 0 0 .593 0 1.325v21.35C0 23.407.593 24 1.325 24h11.493v-9.294H9.692V11.23h3.126V8.75c0-3.13 1.893-4.832 4.656-4.832 1.396 0 2.607.104 2.953.151v3.25l-1.921.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.618h-3.12V24h6.115c.732 0 1.325-.593 1.325-1.325V1.325C24 .593 23.407 0 22.675 0z";
            ariaLabel = "Facebook profile";
            hoverColorClass = "hover:text-blue-700";
            break;
        case 'instagram':
            iconPath = "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.204-.012 3.584-.07 4.85-1.691 3.252-1.691 4.771-4.919 4.919-1.266.058-1.645.069-4.85.069zm0-2.163C8.761 0 8.355.01 7.02.068 2.76 1.092 0 3.86 0 8.121c0 1.336.01 1.742.068 3.076 1.024 4.26 3.792 7.03 8.053 8.053 1.336.058 1.742.068 3.076.068s1.742-.01 3.076-.068c4.26-1.024 7.03-3.792 8.053-8.053.058-1.336.068-1.742.068-3.076s-.01-1.742-.068-3.076C22.908 1.092 20.14 0 15.879 0c-1.336 0-1.742.01-3.076.068zM12 5.837a6.163 6.163 0 100 12.326 6.163 6.163 0 000-12.326zM12 16a4 4 0 110-8 4 4 0 010 8zm6.5-11.5a1.25 1.25 0 100 2.5 1.25 1.25 0 000-2.5z";
            ariaLabel = "Instagram profile";
            hoverColorClass = "hover:text-pink-500";
            break;
        case 'youtube':
            iconPath = "M23.05 6.002c-.22-.82-.875-1.488-1.705-1.708C19.78 4 12 4 12 4s-7.78 0-9.345.294c-.83.22-1.485.888-1.705 1.708C0 7.352 0 12 0 12s0 4.648.22 6.002c.22.82.875 1.488 1.705 1.708C4.22 20 12 20 12 20s7.78 0 9.345-.294c.83-.22 1.485-.888 1.705-1.708C24 16.648 24 12 24 12s0-4.648-.95-5.998zM9.545 15.455V8.545L16.2 12l-6.655 3.455z";
            ariaLabel = "YouTube channel";
            hoverColorClass = "hover:text-red-600";
            break;
        case 'github':
            iconPath = "M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.6.11 0-.173.003-.372v-1.125c-3.328.724-4.025-1.605-4.025-1.605-.542-1.372-1.322-1.737-1.322-1.737-1.087-.74.085-.726.085-.726 1.205.086 1.838 1.238 1.838 1.238 1.07 1.833 2.808 1.305 3.493.998.108-.775.417-1.305.76-1.605-2.665-.3-5.466-1.334-5.466-5.932 0-1.31.465-2.382 1.235-3.22-.12-.303-.535-1.52.12-3.175 0 0 1.008-.323 3.3 1.23.957-.266 1.983-.4 3-.404 1.017.004 2.043.138 3 .404 2.29-1.553 3.297-1.23 3.297-1.23.655 1.655.24 2.872.12 3.175.77.838 1.235 1.91 1.235 3.22 0 4.61-2.805 5.624-5.475 5.923.42.36.81 1.096.81 2.222v3.293c0 .199.003.482.603.372C20.562 21.8 24 17.302 24 12 24 5.373 18.627 0 12 0z";
            ariaLabel = "GitHub profile";
            hoverColorClass = "hover:text-gray-900 dark:hover:text-white";
            break;
        case 'website':
            iconPath = "M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm1 16h-2v-2h2v2zm0-4h-2V8h2v4zm-1-9c-3.866 0-7 3.134-7 7s3.134 7 7 7 7-3.134 7-7-3.134-7-7-7z"; // Generic globe icon
            ariaLabel = "Website";
            hoverColorClass = "hover:text-indigo-600";
            break;
        case 'whatsapp':
            iconPath = "M12.04 2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm4.722 17.348c-.287.161-1.674.832-1.93.993-.257.16-.505.18-.752.02-.247-.16-.968-.356-1.84-.897-1.217-.768-2.023-2.046-2.269-2.458-.246-.412-.026-.64.14-.801.144-.161.32-.419.48-.62.16-.201.213-.357.32-.593.107-.236.053-.443-.026-.621-.08-.179-.753-1.802-1.03-2.459-.277-.657-.554-.543-.752-.555-.16-.009-.348-.009-.536-.009-.208 0-.547.078-.887.394-.34.316-1.3 1.256-1.3 3.065 0 1.81 1.323 3.532 1.51 3.79.187.258 2.602 3.992 6.22 5.535 3.617 1.543 3.617 1.028 4.27 1.028.653 0 2.07-.842 2.36-1.65.289-.809.289-1.503.209-1.65-.08-.147-.297-.236-.62-.383z";
            ariaLabel = "WhatsApp contact";
            hoverColorClass = "hover:text-green-500";
            break;
        case 'tiktok':
            iconPath = "M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-1.848 3.099c-.198-.01-.397-.008-.595 0-2.316.03-4.184 1.986-4.184 4.312 0 1.22.52 2.327 1.365 3.094-.616 1.085-1.56 2.062-2.736 2.923C3.593 14.654 2.87 15.11 2.3 15.655c.446.52.936.985 1.442 1.39.26.208.52.416.78.625.568.452 1.07.828 1.517 1.096 1.107.669 2.072 1.03 2.842 1.03.35 0 .685-.067 1-.2C9.53 19.532 9.872 19.09 10.22 18.65c.348-.44.697-.87.962-1.25.265-.38.45-.69.55-.93.1-.24.16-.39.18-.45.02-.06.01-.12-.03-.18-.04-.06-.11-.11-.21-.15-.1-.04-.21-.05-.33-.04-.12.01-.24.03-.36.06-.12.03-.25.07-.38.12-.13.05-.26.09-.4.12-.14.03-.28.05-.43.05-.15 0-.3-.02-.45-.06-.15-.04-.3-.09-.44-.15-.14-.06-.27-.12-.4-.2-.13-.08-.25-.16-.37-.25-.12-.09-.23-.19-.34-.3-.11-.11-.21-.22-.3-.34-.09-.12-.17-.25-.24-.39-.07-.14-.13-.28-.18-.42-.05-.14-.08-.28-.08-.43 0-.15.02-.3.05-.45.03-.15.07-.3.12-.44.05-.14.1-.27.15-.4.05-.13.09-.25.12-.38.03-.13.04-.25.04-.38 0-.13-.01-.25-.03-.38-.02-.13-.05-.25-.09-.38-.04-.13-.09-.25-.15-.38-.06-.13-.13-.25-.2-.37-.07-.12-.15-.24-.24-.36-.09-.12-.18-.24-.28-.35-.1-.11-.21-.21-.32-.3-.11-.09-.22-.17-.34-.23-.12-.06-.25-.1-.38-.12-.13-.02-.26-.03-.39-.02-.13.01-.25.03-.38.06-.13.03-.25.07-.37.12-.12.05-.24.09-.35.13-.11.04-.22.06-.32.07-.1.01-.19.01-.26-.01zm7.848 10.901c.198.01.397.008.595 0 2.316-.03 4.184-1.986 4.184-4.312 0-1.22-.52-2.327-1.365-3.094.616-1.085 1.56-2.062 2.736-2.923C20.407 9.346 21.13 8.89 21.7 8.345c-.446-.52-.936-.985-1.442-1.39-.26-.208-.52-.416-.78-.625-.568-.452-1.07-.828-1.517-1.096-1.107-.669-2.072-1.03-2.842-1.03-.35 0-.685.067-1 .2-.348.138-.69.58-.962.96-.272.38-.45.69-.55.93-.1.24-.16.39-.18.45-.02.06-.01.12-.03.18-.04-.06-.11-.11-.21-.15-.1-.04-.21-.05-.33-.04-.12.01-.24.03-.36.06-.12.03-.25.07-.38.12-.13.05-.26.09-.4.12-.14.03-.28.05-.43.05-.15 0-.3-.02-.45-.06-.15-.04-.3-.09-.44-.15-.14-.06-.27-.12-.4-.2-.13-.08-.25-.16-.37-.25-.12-.09-.23-.19-.34-.3-.11-.11-.21-.22-.3-.34-.09-.12-.17-.25-.24-.39-.07-.14-.13-.28-.18-.42-.05-.14-.08-.28-.08-.43 0-.15-.02-.3-.05-.45-.03-.15-.07-.3-.12-.44-.05-.14-.1-.27-.15-.4-.05-.13-.09-.25-.12-.38-.03-.13-.04-.25-.04-.38 0-.13.01-.25.03-.38.02-.13.05-.25.09-.38-.04-.13-.09-.25-.15-.38-.06-.13-.13-.25-.2-.37-.07-.12-.15-.24-.24-.36-.09-.12-.18-.24-.28-.35-.1-.11-.21-.21-.32-.3-.11-.09-.22-.17-.34-.23-.12-.06-.25-.1-.38-.12-.13-.02-.26-.03-.39-.02-.13.01-.25.03-.38.06-.13.03-.25.07-.37.12-.12.05-.24.09-.35.13-.11.04-.22.06-.32.07-.1.01-.19.01-.26-.01z";
            ariaLabel = "TikTok profile";
            hoverColorClass = "hover:text-black dark:hover:text-white";
            break;
        case 'snapchat':
            iconPath = "M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-1.848 3.099c-.198-.01-.397-.008-.595 0-2.316.03-4.184 1.986-4.184 4.312 0 1.22.52 2.327 1.365 3.094-.616 1.085-1.56 2.062-2.736 2.923C3.593 14.654 2.87 15.11 2.3 15.655c.446.52.936.985 1.442 1.39.26.208.52.416.78.625.568.452 1.07.828 1.517 1.096 1.107.669 2.072 1.03 2.842 1.03.35 0 .685-.067 1-.2C9.53 19.532 9.872 19.09 10.22 18.65c.348-.44.697-.87.962-1.25.265-.38.45-.69.55-.93.1-.24.16-.39.18-.45.02-.06.01-.12-.03-.18-.04-.06-.11-.11-.21-.15-.1-.04-.21-.05-.33-.04-.12.01-.24.03-.36.06-.12.03-.25.07-.38.12-.13.05-.26.09-.4.12-.14.03-.28.05-.43.05-.15 0-.3-.02-.45-.06-.15-.04-.3-.09-.44-.15-.14-.06-.27-.12-.4-.2-.13-.08-.25-.16-.37-.25-.12-.09-.23-.19-.34-.3-.11-.11-.21-.22-.3-.34-.09-.12-.17-.25-.24-.39-.07-.14-.13-.28-.18-.42-.05-.14-.08-.28-.08-.43 0-.15.02-.3.05-.45.03-.15.07-.3.12-.44.05-.14.1-.27.15-.4.05-.13.09-.25.12-.38.03-.13.04-.25.04-.38 0-.13-.01-.25-.03-.38-.02-.13-.05-.25-.09-.38-.04-.13-.09-.25-.15-.38-.06-.13-.13-.25-.2-.37-.07-.12-.15-.24-.24-.36-.09-.12-.18-.24-.28-.35-.1-.11-.21-.21-.32-.3-.11-.09-.22-.17-.34-.23-.12-.06-.25-.1-.38-.12-.13-.02-.26-.03-.39-.02-.13.01-.25.03-.38.06-.13.03-.25.07-.37.12-.12.05-.24.09-.35.13-.11.04-.22.06-.32.07-.1.01-.19.01-.26-.01zm7.848 10.901c.198.01.397.008.595 0 2.316-.03 4.184-1.986 4.184-4.312 0-1.22-.52-2.327-1.365-3.094.616-1.085 1.56-2.062 2.736-2.923C20.407 9.346 21.13 8.89 21.7 8.345c-.446-.52-.936-.985-1.442-1.39-.26-.208-.52-.416-.78-.625-.568-.452-1.07-.828-1.517-1.096-1.107-.669-2.072-1.03-2.842-1.03-.35 0-.685.067-1 .2-.348.138-.69.58-.962.96-.272.38-.45.69-.55.93-.1.24-.16.39-.18.45-.02.06-.01.12-.03.18-.04-.06-.11-.11-.21-.15-.1-.04-.21-.05-.33-.04-.12.01-.24.03-.36.06-.12.03-.25.07-.38.12-.13.05-.26.09-.4.12-.14.03-.28.05-.43.05-.15 0-.3-.02-.45-.06-.15-.04-.3-.09-.44-.15-.14-.06-.27-.12-.4-.2-.13-.08-.25-.16-.37-.25-.12-.09-.23-.19-.34-.3-.11-.11-.21-.22-.3-.34-.09-.12-.17-.25-.24-.39-.07-.14-.13-.28-.18-.42-.05-.14-.08-.28-.08-.43 0-.15.02-.3.05-.45.03-.15.07-.3.12-.44-.05-.14-.1-.27-.15-.4-.05-.13-.09-.25-.12-.38-.03-.13-.04-.25-.04-.38 0-.13.01-.25.03-.38.02-.13.05-.25.09-.38-.04-.13-.09-.25-.15-.38-.06-.13-.13-.25-.2-.37-.07-.12-.15-.24-.24-.36-.09-.12-.18-.24-.28-.35-.1-.11-.21-.21-.32-.3-.11-.09-.22-.17-.34-.23-.12-.06-.25-.1-.38-.12-.13-.02-.26-.03-.39-.02-.13.01-.25.03-.38.06-.13.03-.25.07-.37.12-.12.05-.24.09-.35.13-.11.04-.22.06-.32.07-.1.01-.19.01-.26-.01z";
            ariaLabel = "Snapchat profile";
            hoverColorClass = "hover:text-yellow-400";
            break;
        case 'telegram':
            iconPath = "M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.626 7.64c-.45-.426-1.077-.665-1.74-.665-1.572 0-3.143-.002-4.715 0-.74.004-1.424.286-1.956.818-1.04.996-1.04 2.593-.005 3.588.665.637 1.63 1.053 2.65 1.04 1.571-.005 3.142.001 4.713 0 .666-.002 1.34-.257 1.83-.81.656-.723 1.047-1.737 1.047-2.825 0-1.088-.39-2.102-1.047-2.825zm-5.626 8.72c.45.426 1.077.665 1.74.665 1.572 0 3.143.002 4.715 0 .74-.004 1.424-.286 1.956-.818 1.04-.996 1.04-2.593-.005-3.588-.665-.637-1.63-1.053-2.65-1.04-1.571.005-3.142-.001-4.713 0-.666.002-1.34.257-1.83.81-.656.723-1.047 1.737-1.047 2.825 0 1.088.39 2.102 1.047 2.825z";
            ariaLabel = "Telegram channel";
            hoverColorClass = "hover:text-blue-500";
            break;
        case 'behance':
            iconPath = "M22.186 9.38C22.186 5.86 19.387 3 15.867 3H8.133C4.613 3 1.814 5.86 1.814 9.38v5.24C1.814 18.14 4.613 21 8.133 21h7.734c3.52 0 6.319-2.86 6.319-6.38V9.38zm-11.833 7.84H7.28c-.552 0-1-.448-1-1v-5.24c0-.552.448-1 1-1h3.073c.552 0 1 .448 1 1v5.24c0 .552-.448 1-1 1zm7.147 0H14.42c-.552 0-1-.448-1-1v-5.24c0-.552.448-1 1-1h3.073c.552 0 1 .448 1 1v5.24c0 .552-.448 1-1 1zM10.353 7.747c-.552 0-1-.448-1-1v-1.127c0-.552.448-1 1-1h.23c.552 0 1 .448 1 1v1.127c0 .552-.448 1-1 1h-.23zm7.147 0c-.552 0-1-.448-1-1v-1.127c0-.552.448-1 1-1h.23c.552 0 1 .448 1 1v1.127c0 .552-.448 1-1 1h-.23z";
            ariaLabel = "Behance profile";
            hoverColorClass = "hover:text-blue-700";
            break;
        case 'dribbble':
            iconPath = "M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-1.848 3.099c-.198-.01-.397-.008-.595 0-2.316.03-4.184 1.986-4.184 4.312 0 1.22.52 2.327 1.365 3.094-.616 1.085-1.56 2.062-2.736 2.923C3.593 14.654 2.87 15.11 2.3 15.655c.446.52.936.985 1.442 1.39.26.208.52.416.78.625.568.452 1.07.828 1.517 1.096 1.107.669 2.072 1.03 2.842 1.03.35 0 .685-.067 1-.2C9.53 19.532 9.872 19.09 10.22 18.65c.348-.44.697-.87.962-1.25.265-.38.45-.69.55-.93.1-.24.16-.39.18-.45.02-.06.01-.12-.03-.18-.04-.06-.11-.11-.21-.15-.1-.04-.21-.05-.33-.04-.12.01-.24.03-.36.06-.12.03-.25.07-.38.12-.13.05-.26.09-.4.12-.14.03-.28.05-.43.05-.15 0-.3-.02-.45-.06-.15-.04-.3-.09-.44-.15-.14-.06-.27-.12-.4-.2-.13-.08-.25-.16-.37-.25-.12-.09-.23-.19-.34-.3-.11-.11-.21-.22-.3-.34-.09-.12-.17-.25-.24-.39-.07-.14-.13-.28-.18-.42-.05-.14-.08-.28-.08-.43 0-.15.02-.3.05-.45.03-.15.07-.3.12-.44.05-.14.1-.27.15-.4.05-.13.09-.25.12-.38.03-.13.04-.25.04-.38 0-.13-.01-.25-.03-.38-.02-.13-.05-.25-.09-.38-.04-.13-.09-.25-.15-.38-.06-.13-.13-.25-.2-.37-.07-.12-.15-.24-.24-.36-.09-.12-.18-.24-.28-.35-.1-.11-.21-.21-.32-.3-.11-.09-.22-.17-.34-.23-.12-.06-.25-.1-.38-.12-.13-.02-.26-.03-.39-.02-.13.01-.25.03-.38.06-.13.03-.25.07-.37.12-.12.05-.24.09-.35.13-.11.04-.22.06-.32.07-.1.01-.19.01-.26-.01zm7.848 10.901c.198.01.397.008.595 0 2.316-.03 4.184-1.986 4.184-4.312 0-1.22-.52-2.327-1.365-3.094.616-1.085 1.56-2.062 2.736-2.923C20.407 9.346 21.13 8.89 21.7 8.345c-.446-.52-.936-.985-1.442-1.39-.26-.208-.52-.416-.78-.625-.568-.452-1.07-.828-1.517-1.096-1.107-.669-2.072-1.03-2.842-1.03-.35 0-.685.067-1 .2-.348.138-.69.58-.962.96-.272.38-.45.69-.55.93-.1.24-.16.39-.18.45-.02.06-.01.12-.03.18-.04-.06-.11-.11-.21-.15-.1-.04-.21-.05-.33-.04-.12.01-.24.03-.36.06-.12.03-.25.07-.38.12-.13.05-.26.09-.4.12-.14.03-.28.05-.43.05-.15 0-.3-.02-.45-.06-.15-.04-.3-.09-.44-.15-.14-.06-.27-.12-.4-.2-.13-.08-.25-.16-.37-.25-.12-.09-.23-.19-.34-.3-.11-.11-.21-.22-.3-.34-.09-.12-.17-.25-.24-.39-.07-.14-.13-.28-.18-.42-.05-.14-.08-.28-.08-.43 0-.15-.02-.3-.05-.45-.03-.15-.07-.3-.12-.44-.05-.14-.1-.27-.15-.4-.05-.13-.09-.25-.12-.38-.03-.13-.04-.25-.04-.38 0-.13.01-.25.03-.38.02-.13.05-.25.09-.38-.04-.13-.09-.25-.15-.38-.06-.13-.13-.25-.2-.37-.07-.12-.15-.24-.24-.36-.09-.12-.18-.24-.28-.35-.1-.11-.21-.21-.32-.3-.11-.09-.22-.17-.34-.23-.12-.06-.25-.1-.38-.12-.13-.02-.26-.03-.39-.02-.13.01-.25.03-.38.06-.13.03-.25.07-.37.12-.12.05-.24.09-.35.13-.11.04-.22.06-.32.07-.1.01-.19.01-.26-.01z";
            ariaLabel = "Dribbble profile";
            hoverColorClass = "hover:text-pink-600";
            break;
        case 'pinterest':
            iconPath = "M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm1.758 17.065c-.27-.06-.49-.17-.658-.33-.168-.16-.253-.36-.253-.598 0-.253.136-.506.409-.76l.095-.094c.273-.253.409-.49.409-.711 0-.273-.136-.506-.409-.7-.273-.195-.49-.292-.658-.292-.253 0-.448.115-.584.343-.136.228-.204.49-.204.786 0 .445-.228.807-.684 1.085-.456.278-1.047.417-1.773.417-1.14 0-2.07-.376-2.79-1.127-.72-.751-1.08-1.748-1.08-2.99 0-1.09.28-1.986.84-2.686.56-.7 1.34-1.05 2.34-1.05 1.047 0 1.83.254 2.35.76.52.507.78 1.2.78 2.08 0 .49-.076.92-.228 1.29-.152.37-.36.63-.62.78-.057.038-.114.068-.17.09-.285.114-.598.17-.939.17-.53 0-.965-.114-1.305-.343-.34-.228-.51-.49-.51-.786 0-.228.095-.448.285-.66s.448-.32.722-.32c.152 0 .285.02.399.06s.21-.02.316-.06c.21-.06.38-.17.51-.34.13-.17.19-.34.19-.51 0-.27-.095-.505-.285-.705-.19-.2-.42-.3-.69-.3-.399 0-.713.095-.94.285-.228.19-.395.42-.505.69-.114.27-.228.51-.343.72-.114.21-.21-.38-.285-.59-.076-.21-.114-.38-.114-.51 0-.34.136-.58.409-.72.273-.14.63-.21 1.07-.21 1.09 0 2.02.38 2.78 1.13.76.75 1.14 1.76 1.14 3.03 0 1.25-.39 2.29-.98 3.12-.59.83-1.42 1.24-2.48 1.24-1.07 0-1.99-.39-2.77-1.17-.78-.78-1.17-1.84-1.17-3.18 0-.49.076-.92.228-1.29s.36-.63.62-.78l-.057-.038-.114-.068-.17-.09-.285-.114-.598-.17-.939-.17-.53 0-.965-.114-1.305-.343-.34-.228-.51-.49-.51-.786 0-.228.095-.448.285-.66s.448-.32.722-.32c.152 0 .285.02.399.06s.21-.02.316-.06c.21-.06.38-.17.51-.34.13-.17.19-.34.19-.51 0-.27-.095-.505-.285-.705-.19-.2-.42-.3-.69-.3-.399 0-.713.095-.94.285-.228.19-.395.42-.505.69-.114.27-.228.51-.343.72-.114.21-.21-.38-.285-.59-.076-.21-.114-.38-.114-.51 0-.34.136-.58.409-.72.273-.14.63-.21 1.07-.21 1.09 0 2.02.38 2.78 1.13.76.75 1.14 1.76 1.14 3.03 0 1.25-.39 2.29-.98 3.12-.59.83-1.42 1.24-2.48 1.24-1.07 0-1.99-.39-2.77-1.17-.78-.78-1.17-1.84-1.17-3.18 0-.49.076-.92.228-1.29s.36-.63.62-.78z";
            ariaLabel = "Pinterest profile";
            hoverColorClass = "hover:text-red-600";
            break;
        default:
            iconPath = "M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm1 16h-2v-2h2v2zm0-4h-2V8h2v4zm-1-9c-3.866 0-7 3.134-7 7s3.134 7 7 7 7-3.134 7-7-3.134-7-7-7z"; // Generic globe icon
            ariaLabel = "Link to profile or website";
            hoverColorClass = "hover:text-gray-500 dark:hover:text-gray-300";
            break;
    }

    return (
        <a href={url} target="_blank" rel="noopener noreferrer" aria-label={ariaLabel}
            // Background color for social icons container
            className={`w-10 h-10 flex items-center justify-center bg-it-dark-blue/70 hover:bg-it-dark-blue-light/70 transition-colors duration-200`}>
            <svg className={`w-6 h-6 text-white ${hoverColorClass}`} fill="currentColor" viewBox="0 0 24 24">
                <path d={iconPath} />
            </svg>
        </a>
    );
};

const TeamSection = () => {
    const { i18n, t } = useTranslation();
    const [team, setTeam] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showSocialsForMember, setShowSocialsForMember] = useState(null);
    const [isTouchDevice, setIsTouchDevice] = useState(false);

    const carouselRef = useRef(null);

    const isArabic = i18n.language === 'ar';
    const directionClass = isArabic ? 'rtl' : 'ltr';
    const textAlignmentClass = 'text-center';

    useEffect(() => {
        setIsTouchDevice(window.matchMedia('(hover: none) and (pointer: coarse)').matches);

        const fetchTeam = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(`http://localhost:5000/api/team?lang=${i18n.language}`);
                setTeam(response.data);
            } catch (err) {
                console.error("Error fetching team members:", err);
                setError(t('failed_to_load_team') || 'Failed to load team members.');
            } finally {
                setLoading(false);
            }
        };
        fetchTeam();
    }, [i18n.language, t]);

    const handleShareClick = (memberId) => {
        setShowSocialsForMember(prevId => prevId === memberId ? null : memberId);
    };

    const scrollCarousel = (direction) => {
        if (carouselRef.current) {
            const cardWidth = carouselRef.current.children[0]?.offsetWidth || 0;
            const gap = 32; // Corresponds to Tailwind's gap-8
            const scrollAmount = cardWidth + gap; // Scroll by one card width + gap

            if (direction === 'left') {
                carouselRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            } else {
                carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
        }
    };

    return (
        // الخلفية: بيضاء في الوضع العادي، it-dark-blue في الوضع الداكن
        <section id="team" className={`py-16 md:py-24 bg-white dark:bg-it-dark-blue ${directionClass}`}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative"> {/* Added relative for absolute positioning of buttons */}
                {/* Section Title */}
                <h2
                    // العنوان الرئيسي: it-dark-blue في الوضع العادي، text-white في الوضع الداكن
                    className={`text-4xl md:text-5xl font-extrabold uppercase tracking-widest text-it-dark-blue dark:text-white text-center mb-4 md:mb-6
                        opacity-0 translate-y-4 animate-fade-in-up`}
                >
                    {t('team_title') || 'Meet Our Leadership'}
                </h2>
                {/* Section Subtitle/Description (kept commented as in original) */}
                {/* <p className={`text-lg md:text-xl text-gray-600 dark:text-gray-400 text-center max-w-3xl mx-auto mb-12 md:mb-16
                                opacity-0 translate-y-4 animate-fade-in-up`}
                    style={{ animationDelay: '100ms' }}
                >
                    {t('team_description') || 'We are driven to improve the lives of our clients, our employees, and our community through our commitment to leadership, excellence in craft, and attention to detail.'}
                </p> */}

                {/* Loading State */}
                {loading && (
                    // أيقونة التحميل والنص: it-dark-blue في الوضع العادي، it-yellow في الوضع الداكن
                    <div className={`flex items-center justify-center gap-3 text-it-dark-blue dark:text-it-yellow text-xl py-8 ${isArabic ? 'flex-row-reverse' : ''}`}>
                        <svg className="animate-spin w-7 h-7" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        <p>{t('loading_team') || 'Loading team members...'}</p>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    // رسالة الخطأ: text-it-yellow، وخلفية it-dark-blue
                    <p className={`text-it-yellow bg-it-dark-blue p-4 rounded-lg mb-6 text-center shadow-md animate-pulse`}>
                        {error}
                    </p>
                )}

                {/* No Team Members Message */}
                {team.length === 0 && !error && !loading ? (
                    // نص "لا توجد خدمات": text-it-dark-blue في الوضع العادي، text-gray-400 في الوضع الداكن
                    <p className={`text-it-dark-blue dark:text-gray-400 text-center text-lg py-8 ${textAlignmentClass}`}>
                        {t('no_team_members_available') || 'No team members available.'}
                    </p>
                ) : (
                    <div className="relative"> {/* Wrapper for carousel and buttons */}
                        <div
                            ref={carouselRef}
                            className="flex overflow-x-hidden snap-x snap-mandatory scroll-smooth pb-4" // Horizontal scroll and snap
                            style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }} // Hide scrollbar for Firefox/Safari
                        >
                            {/* Individual team members */}
                            {team.map((member, index) => (
                                <div
                                    key={member.id}
                                    className={`
                                        flex-shrink-0 w-full sm:w-1/2 md:w-1/3 lg:w-1/3 px-4 // Ensure cards take up 1/3 width on larger screens and handle padding
                                        bg-white dark:bg-it-dark-blue rounded-lg shadow-lg hover:shadow-xl
                                        transition-all duration-300 transform hover:-translate-y-2
                                        text-center group relative overflow-hidden snap-center
                                        opacity-0 translate-y-4 animate-fade-in-up
                                    `}
                                    style={{ animationDelay: `${index * 150}ms` }}
                                >
                                    {member.photo && (
                                        <div className="relative w-full h-80 overflow-hidden">
                                            <img
                                                src={member.photo}
                                                alt={member.name}
                                                className="w-full h-full object-cover object-center grayscale group-hover:grayscale-0 transition-all duration-500 ease-in-out"
                                            />

                                            {/* Social Icons Container and Share Button */}
                                            <div className={`
                                                absolute right-0 top-1/2 transform -translate-y-1/2
                                                flex flex-col gap-0.5
                                                pr-4
                                                ${isTouchDevice
                                                    ? (showSocialsForMember === member.id ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full')
                                                    : 'opacity-0 translate-x-full group-hover:opacity-100 group-hover:translate-x-0'
                                                }
                                                transition-all duration-300 ease-in-out
                                            `}>
                                                {member.socials && member.socials.map((social, idx) => (
                                                    <SocialIcon key={idx} platform={social.platform} url={social.url} />
                                                ))}
                                                <button
                                                    onClick={() => handleShareClick(member.id)}
                                                    // زر المشاركة: bg-it-yellow، text-it-dark-blue، hover:bg-it-yellow-dark
                                                    className="w-10 h-10 flex items-center justify-center bg-it-yellow text-it-dark-blue shadow-md
                                                        hover:bg-it-yellow-dark transition-colors duration-200 mt-0.5
                                                        focus:outline-none focus:ring-2 focus:ring-it-yellow-light focus:ring-opacity-75"
                                                    aria-label={`Share ${member.name}'s profile`}
                                                >
                                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L7.94 9.84c-.52-.47-1.2-.77-1.96-.77-1.66 0-3 1.34-3 3s1.34 3 3 3c.76 0 1.44-.3 1.96-.77l7.05 4.11c-.05.23-.09.46-.09.7 0 1.66 1.34 3 3 3s3-1.34 3-3-1.34-3-3-3z"/>
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    <div className="p-6">
                                        <h3
                                            // اسم عضو الفريق: it-dark-blue في الوضع العادي، text-white في الوضع الداكن
                                            className={`text-2xl font-bold text-it-dark-blue dark:text-white mb-1 ${textAlignmentClass}`}>
                                            {member.name}
                                        </h3>
                                        <p
                                            // منصب عضو الفريق: text-gray-700 في الوضع العادي، text-gray-300 في الوضع الداكن
                                            className={`text-lg text-gray-700 dark:text-gray-300 font-medium ${textAlignmentClass}`}>
                                            {member.position}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Navigation Buttons - Render only if more than 3 team members (assuming 3 per row on lg) */}
                        {team.length > 3 && (
                            <>
                                <button
                                    onClick={() => scrollCarousel('left')}
                                    // أزرار التنقل في الكاروسيل:
                                    // الخلفية: bg-it-gray-light-alpha في الوضع العادي، bg-it-dark-blue-light-alpha في الوضع الداكن.
                                    // اللون: text-it-dark-blue في الوضع العادي، text-white في الوضع الداكن.
                                    // Hover: hover:bg-it-gray-medium-alpha في الوضع العادي، hover:bg-it-dark-blue-medium-alpha في الوضع الداكن.
                                    className={`absolute top-1/2 left-0 sm:left-4 transform -translate-y-1/2
                                        bg-it-gray-light-alpha dark:bg-it-dark-blue-light-alpha text-it-dark-blue dark:text-white p-3 rounded-full shadow-lg
                                        hover:bg-it-gray-medium-alpha dark:hover:bg-it-dark-blue-medium-alpha transition-colors duration-200
                                        focus:outline-none focus:ring-2 focus:ring-it-yellow-light focus:ring-opacity-75 z-10
                                        hidden md:block // Hide on small screens, show on medium and up
                                    `}
                                    aria-label="Previous team member"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                                </button>
                                <button
                                    onClick={() => scrollCarousel('right')}
                                    // أزرار التنقل في الكاروسيل: نفس الألوان أعلاه
                                    className={`absolute top-1/2 right-0 sm:right-4 transform -translate-y-1/2
                                        bg-it-gray-light-alpha dark:bg-it-dark-blue-light-alpha text-it-dark-blue dark:text-white p-3 rounded-full shadow-lg
                                        hover:bg-it-gray-medium-alpha dark:hover:bg-it-dark-blue-medium-alpha transition-colors duration-200
                                        focus:outline-none focus:ring-2 focus:ring-it-yellow-light focus:ring-opacity-75 z-10
                                        hidden md:block // Hide on small screens, show on medium and up
                                    `}
                                    aria-label="Next team member"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
};

export default TeamSection;