import { AffiliateLink } from './AffiliateLink';

export const SampleAffiliateProducts = () => {
  const sampleProducts = [
    {
      url: 'https://www.amazon.it/dp/B08N5WRWNW',
      title: 'Echo Dot (4ª generazione) - Altoparlante intelligente con Alexa',
      price: '€29,99',
      originalPrice: '€59,99',
      description: 'Il nostro altoparlante intelligente più venduto con un suono ricco e avvolgente.',
      image: 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=200&h=200&fit=crop',
      affiliate: 'amazon' as const
    },
    {
      url: 'https://www.amazon.it/dp/B0BSHD7LBD',
      title: 'Apple AirPods (3ª generazione)',
      price: '€179,00',
      originalPrice: '€199,00',
      description: 'Audio spaziale personalizzato. Fino a 6 ore di ascolto con una sola carica.',
      image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=200&h=200&fit=crop',
      affiliate: 'amazon' as const
    },
    {
      url: 'https://www.amazon.it/dp/B07PYPKN7J',
      title: 'Kindle Paperwhite (11ª generazione)',
      price: '€139,99',
      originalPrice: '€149,99',
      description: 'Display da 6.8" antiriflesso, resistente all\'acqua, 8 GB.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
      affiliate: 'amazon' as const
    }
  ];

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg mb-4">🛒 Prodotti Consigliati</h3>
      {sampleProducts.map((product, index) => (
        <AffiliateLink
          key={index}
          url={product.url}
          title={product.title}
          price={product.price}
          originalPrice={product.originalPrice}
          description={product.description}
          image={product.image}
          affiliate={product.affiliate}
          className="mb-4"
        />
      ))}
    </div>
  );
};