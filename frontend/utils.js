import { toast } from 'react-toastify';

export const handleSuccess = (msg) => {
    toast.success(msg, {
        position: 'top-right'
    })
}

export const handleError = (msg) => {
    toast.error(msg, {
        position: 'top-right'
    })
}

export const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.readAsDataURL(file);

        fileReader.onload = () => {
            console.log("Base64 string generated successfully:");
            console.log(fileReader.result); // Log the Base64 string for debugging
            resolve(fileReader.result);
        };

        fileReader.onerror = (error) => {
            console.error("Error occurred while converting to base64:", error);
            reject(error);
        };
    });
};

// utils/auth.js

export const isTokenExpired = (token) => {
    if (!token) return true;

    const payload = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = payload.exp * 1000; // Convert expiration time to milliseconds
    return Date.now() >= expirationTime;
};
