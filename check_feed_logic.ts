
interface Product {
    id: string;
    nameEn: string;
    descriptionEn: string;
    price: string;
    discountedPrice?: string | null;
    isHot?: boolean | null;
    hotPrice?: string | null;
    images: string[];
    stock: number;
    category: string;
}

const mockProducts: Product[] = [
    {
        id: "1",
        nameEn: "Test Product",
        descriptionEn: "Test Description",
        price: "1000",
        discountedPrice: "900",
        isHot: false,
        images: ["image1.jpg", "image2.jpg"],
        stock: 10,
        category: "Skincare"
    },
    {
        id: "2",
        nameEn: "Hot Product",
        descriptionEn: "Hot Description",
        price: "2000",
        hotPrice: "1500",
        isHot: true,
        images: ["http://example.com/image3.jpg"],
        stock: 0,
        category: "Makeup"
    }
];

const baseUrl = "http://localhost:5000";

function generateFeed(products: Product[]) {
    let xml = '<?xml version="1.0"?>\n';
    xml += '<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">\n';
    xml += '<channel>\n';

    for (const product of products) {
        const imageUrl = product.images && product.images.length > 0
            ? (product.images[0].startsWith('http') ? product.images[0] : `${baseUrl}${product.images[0]}`)
            : '';

        // Calculate sale price
        let salePrice = null;
        if (product.isHot && product.hotPrice) {
            salePrice = parseFloat(product.hotPrice);
        } else if (product.discountedPrice) {
            salePrice = parseFloat(product.discountedPrice);
        }

        xml += '<item>\n';
        xml += `<g:id>${product.id}</g:id>\n`;
        xml += `<g:title><![CDATA[${product.nameEn}]]></g:title>\n`;
        xml += `<g:description><![CDATA[${product.descriptionEn}]]></g:description>\n`;
        xml += `<g:link>${baseUrl}/product/${product.id}</g:link>\n`;
        xml += `<g:image_link>${imageUrl}</g:image_link>\n`;

        // Additional images
        if (product.images && product.images.length > 1) {
            for (let i = 1; i < product.images.length; i++) {
                const addImg = product.images[i].startsWith('http') ? product.images[i] : `${baseUrl}${product.images[i]}`;
                xml += `<g:additional_image_link>${addImg}</g:additional_image_link>\n`;
            }
        }

        xml += `<g:brand>LUNAVEIL</g:brand>\n`;
        xml += `<g:condition>new</g:condition>\n`;
        xml += `<g:availability>${product.stock > 0 ? 'in stock' : 'out of stock'}</g:availability>\n`;
        xml += `<g:price>${parseFloat(product.price).toFixed(2)} BDT</g:price>\n`;

        if (salePrice) {
            xml += `<g:sale_price>${salePrice.toFixed(2)} BDT</g:sale_price>\n`;
        }

        xml += `<g:product_type><![CDATA[${product.category}]]></g:product_type>\n`;
        xml += `<g:google_product_category>1604</g:google_product_category>\n`;

        // Custom labels for ad targeting
        if (product.isHot) {
            xml += `<g:custom_label_0>Hot Deal</g:custom_label_0>\n`;
        }
        xml += `<g:custom_label_1>${product.category}</g:custom_label_1>\n`;

        xml += '</item>\n';
    }

    xml += '</channel>\n';
    xml += '</rss>';
    return xml;
}

console.log(generateFeed(mockProducts));
