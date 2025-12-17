/**
 * UTILITAIRES POUR GÉNÉRATION D'ÉTIQUETTES
 * Génération de PDF, codes-barres, QR codes
 */

import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';
import type {
  ConfigurationEtiquette,
  DonneesEtiquette,
  FormatCodeBarre,
} from '../types';

/**
 * Générer un code-barres sous forme de data URL
 */
export async function genererCodeBarre(
  valeur: string,
  format: FormatCodeBarre
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      
      if (format === 'QR') {
        // QR Code
        QRCode.toCanvas(canvas, valeur, {
          width: 200,
          margin: 1,
        }, (error) => {
          if (error) {
            reject(error);
          } else {
            resolve(canvas.toDataURL());
          }
        });
      } else {
        // Code-barres traditionnel (EAN13, CODE128)
        JsBarcode(canvas, valeur, {
          format: format,
          width: 2,
          height: 50,
          displayValue: true,
          fontSize: 12,
        });
        resolve(canvas.toDataURL());
      }
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Générer un QR code sous forme de data URL
 */
export async function genererQRCode(data: string): Promise<string> {
  try {
    return await QRCode.toDataURL(data, {
      width: 150,
      margin: 1,
    });
  } catch (error) {
    console.error('Erreur génération QR code:', error);
    throw error;
  }
}

/**
 * Générer une étiquette PDF
 */
export async function genererEtiquettePDF(
  donnees: DonneesEtiquette,
  config: ConfigurationEtiquette
): Promise<void> {
  const pdf = new jsPDF({
    orientation: config.largeur_mm > config.hauteur_mm ? 'l' : 'p',
    unit: 'mm',
    format: [config.largeur_mm, config.hauteur_mm],
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 3;
  let yPos = margin + 5;

  // Titre du produit
  pdf.setFontSize(config.taille_police + 2);
  pdf.setFont('helvetica', 'bold');
  pdf.text(donnees.nom_produit, pageWidth / 2, yPos, { align: 'center' });
  yPos += 5;

  pdf.setFontSize(config.taille_police - 2);
  pdf.setFont('helvetica', 'normal');
  pdf.text(
    `${donnees.recette_nom} - ${donnees.quantite} cookies`,
    pageWidth / 2,
    yPos,
    { align: 'center' }
  );
  yPos += 6;

  // Prix
  if (config.afficher_prix && donnees.prix_vente) {
    pdf.setFontSize(config.taille_police + 4);
    pdf.setFont('helvetica', 'bold');
    pdf.text(
      `${donnees.prix_vente.toFixed(2)} €`,
      pageWidth / 2,
      yPos,
      { align: 'center' }
    );
    yPos += 7;
  }

  // Ingrédients
  if (config.afficher_ingredients && donnees.liste_ingredients) {
    pdf.setFontSize(config.taille_police - 3);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Ingrédients:', margin, yPos);
    yPos += 4;

    pdf.setFont('helvetica', 'normal');
    const ingredientsText = donnees.liste_ingredients.join(', ');
    const splitText = pdf.splitTextToSize(
      ingredientsText,
      pageWidth - 2 * margin
    );
    pdf.text(splitText, margin, yPos);
    yPos += splitText.length * 3 + 2;
  }

  // Allergènes
  if (config.afficher_allergenes && donnees.allergenes && donnees.allergenes.length > 0) {
    pdf.setFontSize(config.taille_police - 3);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Allergènes:', margin, yPos);
    yPos += 4;

    pdf.setFont('helvetica', 'italic');
    const allergenesText = donnees.allergenes.join(', ');
    const splitText = pdf.splitTextToSize(
      allergenesText,
      pageWidth - 2 * margin
    );
    pdf.text(splitText, margin, yPos);
    yPos += splitText.length * 3 + 2;
  }

  // Dates
  if (config.afficher_date_production && donnees.date_production) {
    pdf.setFontSize(config.taille_police - 3);
    pdf.setFont('helvetica', 'normal');
    const dateProd = donnees.date_production.toLocaleDateString('fr-FR');
    pdf.text(`Production: ${dateProd}`, margin, yPos);
    yPos += 4;
  }

  if (config.afficher_date_peremption && donnees.date_peremption) {
    pdf.setFontSize(config.taille_police - 3);
    pdf.setFont('helvetica', 'bold');
    const datePer = donnees.date_peremption.toLocaleDateString('fr-FR');
    pdf.text(`À consommer avant: ${datePer}`, margin, yPos);
    yPos += 4;
  }

  // Numéro de lot
  if (donnees.numero_lot) {
    pdf.setFontSize(config.taille_police - 4);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Lot: ${donnees.numero_lot}`, margin, yPos);
    yPos += 4;
  }

  // Code-barres
  if (config.inclure_code_barre && donnees.code_barre) {
    try {
      const barcodeImg = await genererCodeBarre(
        donnees.code_barre,
        config.format_code_barre
      );
      const imgHeight = 15;
      const imgWidth = pageWidth - 2 * margin;
      pdf.addImage(
        barcodeImg,
        'PNG',
        margin,
        pageHeight - imgHeight - margin,
        imgWidth,
        imgHeight
      );
    } catch (error) {
      console.error('Erreur ajout code-barres:', error);
    }
  }

  // QR Code
  if (config.inclure_qr_code && donnees.qr_code_data) {
    try {
      const qrImg = await genererQRCode(donnees.qr_code_data);
      const qrSize = 20;
      pdf.addImage(
        qrImg,
        'PNG',
        pageWidth - qrSize - margin,
        margin,
        qrSize,
        qrSize
      );
    } catch (error) {
      console.error('Erreur ajout QR code:', error);
    }
  }

  // Sauvegarder le PDF
  const nomFichier = `etiquette_${donnees.nom_produit.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
  pdf.save(nomFichier);
}

/**
 * Générer un lot d'étiquettes pour plusieurs produits
 */
export async function genererLotEtiquettes(
  listeEtiquettes: DonneesEtiquette[],
  config: ConfigurationEtiquette
): Promise<void> {
  const pdf = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4',
  });

  const etiquettesParLigne = Math.floor(210 / config.largeur_mm);
  const etiquettesParColonne = Math.floor(297 / config.hauteur_mm);
  const etiquettesParPage = etiquettesParLigne * etiquettesParColonne;

  for (let i = 0; i < listeEtiquettes.length; i++) {
    if (i > 0 && i % etiquettesParPage === 0) {
      pdf.addPage();
    }

    const positionDansPage = i % etiquettesParPage;
    const ligne = Math.floor(positionDansPage / etiquettesParLigne);
    const colonne = positionDansPage % etiquettesParLigne;

    const x = colonne * config.largeur_mm;
    const y = ligne * config.hauteur_mm;

    // Dessiner le cadre de l'étiquette
    pdf.setDrawColor(200);
    pdf.rect(x, y, config.largeur_mm, config.hauteur_mm);

    // Contenu simplifié pour lot
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text(
      listeEtiquettes[i].nom_produit,
      x + config.largeur_mm / 2,
      y + 5,
      { align: 'center', maxWidth: config.largeur_mm - 4 }
    );

    const prixVente = listeEtiquettes[i].prix_vente;
    if (prixVente !== undefined) {
      pdf.setFontSize(12);
      pdf.text(
        `${prixVente.toFixed(2)} €`,
        x + config.largeur_mm / 2,
        y + config.hauteur_mm / 2,
        { align: 'center' }
      );
    }

    // Code-barres si demandé
    const codeBarre = listeEtiquettes[i].code_barre;
    if (config.inclure_code_barre && codeBarre) {
      try {
        const barcodeImg = await genererCodeBarre(
          codeBarre,
          config.format_code_barre
        );
        const imgHeight = config.hauteur_mm / 3;
        const imgWidth = config.largeur_mm - 4;
        pdf.addImage(
          barcodeImg,
          'PNG',
          x + 2,
          y + config.hauteur_mm - imgHeight - 2,
          imgWidth,
          imgHeight
        );
      } catch (error) {
        console.error('Erreur ajout code-barres lot:', error);
      }
    }
  }

  const nomFichier = `lot_etiquettes_${Date.now()}.pdf`;
  pdf.save(nomFichier);
}

/**
 * Générer un code EAN-13 aléatoire valide
 */
export function genererEAN13(): string {
  // Générer 12 chiffres aléatoires
  let code = '';
  for (let i = 0; i < 12; i++) {
    code += Math.floor(Math.random() * 10).toString();
  }

  // Calculer la clé de contrôle (13ème chiffre)
  let somme = 0;
  for (let i = 0; i < 12; i++) {
    const chiffre = parseInt(code[i]);
    somme += i % 2 === 0 ? chiffre : chiffre * 3;
  }
  const cle = (10 - (somme % 10)) % 10;

  return code + cle.toString();
}

/**
 * Calculer la date de péremption
 */
export function calculerDatePeremption(
  dateProduction: Date,
  joursValidite: number
): Date {
  const date = new Date(dateProduction);
  date.setDate(date.getDate() + joursValidite);
  return date;
}
