import { useEffect } from 'react';

export default function SocialMetaTags({
  title = "🧡💙 College Fast Forward - Get Gators Hired",
  description = "🐊 When parents open their networks, Gators get hired! Connect with 12,000+ UF students and parents for internships, jobs, and career advice. Go Gators! 🎓",
  image = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/684474c5723dc90efce23588/b27e39f30_collegefastforwardlogo.png",
  url = "https://www.collegefastforward.com"
}) {
  useEffect(() => {
    // Set document title
    document.title = title;

    // Helper function to set or update meta tag
    const setMetaTag = (property, content, isName = false) => {
      const attribute = isName ? 'name' : 'property';
      let tag = document.querySelector(`meta[${attribute}="${property}"]`);
      
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attribute, property);
        document.head.appendChild(tag);
      }
      
      tag.setAttribute('content', content);
    };

    // Open Graph tags (Facebook, LinkedIn)
    setMetaTag('og:title', title);
    setMetaTag('og:description', description);
    setMetaTag('og:image', image);
    setMetaTag('og:url', url);
    setMetaTag('og:type', 'website');
    setMetaTag('og:site_name', 'College Fast Forward');

    // Twitter Card tags
    setMetaTag('twitter:card', 'summary_large_image', true);
    setMetaTag('twitter:title', title, true);
    setMetaTag('twitter:description', description, true);
    setMetaTag('twitter:image', image, true);

    // Additional meta tags for better SEO
    setMetaTag('description', description, true);
    setMetaTag('keywords', 'UF, University of Florida, Gators, career network, internships, jobs, parents, mentorship, college students', true);

  }, [title, description, image, url]);

  return null;
}