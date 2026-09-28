import fs from 'fs';
import csv from 'csv-parser';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function extractCategory(title) {
  // Simple category extraction from title
  const keywords = {
    'Resistencia': 'Componentes',
    'Transistor': 'Componentes',
    'Ventilador': 'Ventilación',
    'Sensor': 'Sensores',
    'Capacitor': 'Componentes',
    'Diodo': 'Componentes',
    'LED': 'LEDs',
    'Fuente': 'Fuentes de Poder',
    'Cable': 'Cableado',
    'Conector': 'Conectores',
  };

  for (const [keyword, category] of Object.entries(keywords)) {
    if (title.toLowerCase().includes(keyword.toLowerCase())) {
      return category;
    }
  }
  return 'Otros';
}

async function ensureCategory(name) {
  const result = await pool.query(
    'SELECT id FROM categories WHERE name = $1',
    [name]
  );

  if (result.rows.length > 0) {
    return result.rows[0].id;
  }

  const newCat = await pool.query(
    'INSERT INTO categories (name, slug, is_visible) VALUES ($1, $2, true) RETURNING id',
    [name, name.toLowerCase().replace(/ /g, '-')]
  );

  return newCat.rows[0].id;
}

async function ensureSubcategory(categoryId, subcategoryName) {
  const result = await pool.query(
    'SELECT id FROM subcategories WHERE category_id = $1 AND name = $2',
    [categoryId, subcategoryName]
  );

  if (result.rows.length > 0) {
    return result.rows[0].id;
  }

  const newSubcat = await pool.query(
    'INSERT INTO subcategories (category_id, name, slug, is_visible) VALUES ($1, $2, $3, true) RETURNING id',
    [categoryId, subcategoryName, subcategoryName.toLowerCase().replace(/ /g, '-')]
  );

  return newSubcat.rows[0].id;
}

async function importProducts(csvPath) {
  console.log('📦 Starting product import from:', csvPath);

  const startTime = Date.now();
  let count = 0;
  let errors = 0;
  const categoryCache = {};
  const subcategoryCache = {};

  return new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', async (row) => {
        try {
          const modelo = row['Modelo'];
          const marca = row['Marca'] || '';
          const title = row['Título'];
          const precioVenta = parseFloat(row['Su Precio']) || 0;
          const precioLista = parseFloat(row['Precio Lista']) || 0;
          const precioEspecial = parseFloat(row['Precio Especial']) || 0;
          const codigoFiscal = row['Código Fiscal'] || '';
          const pesoKg = parseFloat(row['Peso Kg']) || 0;
          const imagenPrincipal = row['Imagen Principal'] || '';
          const idProductoOriginal = parseInt(row['ID Producto']) || null;
          const description = row['Descripción'] || '';

          // Get category
          const categoryName = await extractCategory(title);
          let categoryId = categoryCache[categoryName];

          if (!categoryId) {
            categoryId = await ensureCategory(categoryName);
            categoryCache[categoryName] = categoryId;
          }

          // Get subcategory (marca or generic)
          const subcategoryName = marca || 'Sin Marca';
          const subcatKey = `${categoryId}-${subcategoryName}`;
          let subcategoryId = subcategoryCache[subcatKey];

          if (!subcategoryId) {
            subcategoryId = await ensureSubcategory(categoryId, subcategoryName);
            subcategoryCache[subcatKey] = subcategoryId;
          }

          // Insert product
          await pool.query(
            `INSERT INTO products (
              modelo, marca, title, description, category_id, subcategory_id,
              precio_lista, precio_especial, precio_venta,
              codigo_fiscal, peso_kg, imagen_principal, id_producto_original, is_active
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, true)
            ON CONFLICT (modelo) DO UPDATE SET
              marca = $2,
              title = $3,
              description = $4,
              category_id = $5,
              subcategory_id = $6,
              precio_lista = $7,
              precio_especial = $8,
              precio_venta = $9,
              updated_at = CURRENT_TIMESTAMP`,
            [modelo, marca, title, description, categoryId, subcategoryId,
             precioLista, precioEspecial, precioVenta,
             codigoFiscal, pesoKg, imagenPrincipal, idProductoOriginal]
          );

          count++;
          if (count % 100 === 0) {
            console.log(`✅ ${count} products imported...`);
          }
        } catch (err) {
          errors++;
          if (errors <= 5) {
            console.error(`❌ Error on row ${count}:`, err.message);
          }
        }
      })
      .on('end', async () => {
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`\n✨ Import complete!`);
        console.log(`📊 Imported: ${count} products`);
        console.log(`⚠️  Errors: ${errors}`);
        console.log(`⏱️  Duration: ${duration}s`);

        await pool.end();
        resolve();
      })
      .on('error', (err) => {
        console.error('❌ CSV parsing error:', err);
        reject(err);
      });
  });
}

// Run import
const csvPath = process.argv[2] || 'C:\\Users\\Alan\\Downloads\\ProductosHora.csv';
importProducts(csvPath).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
