import { Helmet } from 'react-helmet-async'

export default function SEO({ title, description, image, url, schema }) {
  const siteName = 'Pragati Kurties'
  const fullTitle = title ? `${title} | ${siteName}` : siteName
  const defaultDesc = 'Premium ethnic wear for the modern woman. Shop latest Kurtis, Suits, and Lehengas.'
  const fullDesc = description || defaultDesc

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={fullDesc} />
      
      {/* Canonical URL for strict deduplication */}
      {url && <link rel="canonical" href={url} />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDesc} />
      {image && <meta property="og:image" content={image} />}
      {url && <meta property="og:url" content={url} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDesc} />
      {image && <meta name="twitter:image" content={image} />}

      {/* JSON-LD Structured Data */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  )
}
