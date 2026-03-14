/**
 * config.js — Configuration Flutterwave + Supabase
 * ═══════════════════════════════════════════════════
 * Remplacez les valeurs par vos vraies clés API
 * NE JAMAIS commiter ce fichier avec vos vraies clés !
 * Ajoutez config.js à votre .gitignore
 * ═══════════════════════════════════════════════════
 */

const APP_CONFIG = {

  // ── SUPABASE ──────────────────────────────────────
  supabase: {
    url: 'https://xeezdzbotsblzclnmnxg.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlZXpkemJvdHNibHpjbG5tbnhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0NDk3NTQsImV4cCI6MjA4NjAyNTc1NH0.RHIGavm6M9WCR6nve1Iz_JKFeQRlpRCU2FNAr9E02PM',
  },

  // ── FLUTTERWAVE ───────────────────────────────────
  flutterwave: {
    publicKey: 'FLWPUBK_TEST-679f6a60f03092a0c9bf938951b258d8-X',
    // Récupérez votre clé sur : https://dashboard.flutterwave.com/settings/apis
    // En test : commence par FLWPUBK_TEST-
    // En production : commence par FLWPUBK-

    currency: 'XAF',           // Franc CFA (BEAC)
    country: 'CM',             // Cameroun
    paymentTitle: 'Devis App', // Titre affiché dans le popup Flutterwave
  },

  // ── PLANS TARIFAIRES ─────────────────────────────
  plans: {
    free: {
      name: 'Gratuit',
      price: 0,
      quotesLimit: 5,
      description: 'Jusqu\'à 5 devis à vie',
    },
    monthly: {
      name: 'Mensuel',
      price: 2000,        // XAF
      quotesLimit: 50,
      description: '50 devis par mois',
      flwAmount: 2000,
    },
    annual: {
      name: 'Annuel',
      price: 19200,       // XAF (2000 × 12 - 20%)
      quotesLimit: 50,
      description: '50 devis/mois · économisez 20%',
      flwAmount: 19200,
      savings: '4 800 XAF d\'économie',
    },
  },

  // ── URLS DE REDIRECTION ───────────────────────────
  redirects: {
    // URL appelée par Flutterwave après paiement
    // Mettez l'URL de votre app déployée (Vercel, etc.)
    success: 'devis-app-two.vercel.app/app/payment-success.html',
    cancel:  'devis-app-two.vercel.app/app/dashboard.html',
  },

}

// Export pour utilisation dans les autres fichiers
if (typeof module !== 'undefined') module.exports = APP_CONFIG