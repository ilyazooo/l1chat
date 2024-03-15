import Head from "next/head";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: 'l1chat',
  description: 'Encrypted messaging',
  keywords: ['encryption', 'messaging', 'security', 'privacy'],
  author: 'IO',
  url: 'l1chat.vercel.app',
  image: 'https://i.postimg.cc/tZh61kxX/ttt.png', 
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <meta name="keywords" content={metadata.keywords.join(',')} />
        <meta name="author" content={metadata.author} />
        
        <meta property="og:title" content={metadata.title} />
        <meta property="og:description" content={metadata.description} />
        <meta property="og:url" content={metadata.url} />
        <meta property="og:image" content={metadata.image} />
        <meta property="og:type" content="website" />
        
        <meta name="twitter:title" content={metadata.title} />
        <meta name="twitter:description" content={metadata.description} />
        <meta name="twitter:image" content={metadata.image} />
        <meta name="twitter:card" content="summary_large_image" />
        
        <link rel="canonical" href={metadata.url} />
        <link rel="icon" type="image/png" href="ttt.png" /> 
        
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}