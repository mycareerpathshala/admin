import localFont from 'next/font/local';

export const poppins = localFont({
    src: [
        { path: '../../public/fonts/poppins/Poppins-Thin.woff2',           weight: '100', style: 'normal' },
        { path: '../../public/fonts/poppins/Poppins-ThinItalic.woff2',     weight: '100', style: 'italic' },
        { path: '../../public/fonts/poppins/Poppins-ExtraLight.woff2',     weight: '200', style: 'normal' },
        { path: '../../public/fonts/poppins/Poppins-ExtraLightItalic.woff2', weight: '200', style: 'italic' },
        { path: '../../public/fonts/poppins/Poppins-Light.woff2',          weight: '300', style: 'normal' },
        { path: '../../public/fonts/poppins/Poppins-LightItalic.woff2',    weight: '300', style: 'italic' },
        { path: '../../public/fonts/poppins/Poppins-Regular.woff2',        weight: '400', style: 'normal' },
        { path: '../../public/fonts/poppins/Poppins-Italic.woff2',         weight: '400', style: 'italic' },
        { path: '../../public/fonts/poppins/Poppins-Medium.woff2',         weight: '500', style: 'normal' },
        { path: '../../public/fonts/poppins/Poppins-MediumItalic.woff2',   weight: '500', style: 'italic' },
        { path: '../../public/fonts/poppins/Poppins-SemiBold.woff2',       weight: '600', style: 'normal' },
        { path: '../../public/fonts/poppins/Poppins-SemiBoldItalic.woff2', weight: '600', style: 'italic' },
        { path: '../../public/fonts/poppins/Poppins-Bold.woff2',           weight: '700', style: 'normal' },
        { path: '../../public/fonts/poppins/Poppins-BoldItalic.woff2',     weight: '700', style: 'italic' },
        { path: '../../public/fonts/poppins/Poppins-ExtraBold.woff2',      weight: '800', style: 'normal' },
        { path: '../../public/fonts/poppins/Poppins-ExtraBoldItalic.woff2', weight: '800', style: 'italic' },
        { path: '../../public/fonts/poppins/Poppins-Black.woff2',          weight: '900', style: 'normal' },
        { path: '../../public/fonts/poppins/Poppins-BlackItalic.woff2',    weight: '900', style: 'italic' },
    ],
    variable: '--font-poppins',
    display: 'swap',
});
