

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TABLE : profiles  (extension de auth.users)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  id            UUID          PK, FK → auth.users(id)
  first_name    TEXT
  last_name     TEXT
  company       TEXT          Raison sociale
  address       TEXT          Adresse professionnelle
  legal_form    TEXT          Forme juridique (SARL, SA, EI…)
  rccm          TEXT          N° Registre du commerce (RCCM)
  niu           TEXT          N° Contribuable / NIU
  phone         TEXT          Téléphone professionnel
  created_at    TIMESTAMPTZ   DEFAULT now()

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TABLE : clients
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  id            UUID          PK, DEFAULT gen_random_uuid()
  user_id       UUID          FK → auth.users(id)
  full_name     TEXT          NOT NULL     Nom complet du client
  address       TEXT                       Adresse / Localité
  email         TEXT
  phone         TEXT
  created_at    TIMESTAMPTZ   DEFAULT now()

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TABLE : quotes
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  id              UUID          PK, DEFAULT gen_random_uuid()
  user_id         UUID          FK → auth.users(id)
  client_id       UUID          FK → clients(id)

  -- Identification du document
  quote_number    TEXT                       Numéro auto-généré (DEV-2025-001)

  -- Identité du professionnel (snapshot au moment de la création)
  pro_name        TEXT                       Nom / Prénom
  pro_company     TEXT                       Raison sociale
  pro_address     TEXT                       Adresse complète
  pro_legal_form  TEXT                       Forme juridique
  pro_rccm        TEXT                       N° RCCM
  pro_niu         TEXT                       N° Contribuable / NIU
  pro_phone       TEXT                       Téléphone

  -- Coordonnées client (snapshot)
  client_address  TEXT                       Adresse du client

  -- Dates
  quote_date      DATE                       Date de création du devis
  start_date      DATE                       Date de début de la prestation
  duration        TEXT                       Durée estimée (ex : "5 jours")
  expiry_date     DATE                       Date d'expiration calculée
  validity_days   INT           DEFAULT 30   Durée de validité en jours

  -- Financier
  currency        TEXT          DEFAULT 'XAF'
  subtotal        NUMERIC(15,2) DEFAULT 0    Sous-total HT (prestations)
  labor_cost      NUMERIC(15,2) DEFAULT 0    Coût de main d'œuvre HT
  travel_cost     NUMERIC(15,2) DEFAULT 0    Frais de déplacement HT
  total_ht        NUMERIC(15,2) DEFAULT 0    Total HT (subtotal+labor+travel)
  tax_rate        NUMERIC(5,2)  DEFAULT 19.25  Taux de TVA (%)
  tax_amount      NUMERIC(15,2) DEFAULT 0    Montant de la TVA
  total_amount    NUMERIC(15,2) DEFAULT 0    Total TTC

  -- Conditions légales
  payment_terms   TEXT                       Conditions de paiement
  delivery_terms  TEXT                       Conditions de livraison
  sav_terms       TEXT                       Conditions SAV / Garantie
  notes           TEXT                       Notes / Conditions particulières
  gros_oeuvre     BOOLEAN       DEFAULT FALSE  Mention travaux gros œuvre

  -- Signature client
  signer_name     TEXT                       Nom du signataire
  signature_data  TEXT                       Image base64 de la signature

  -- Statut
  status          TEXT          DEFAULT 'draft'
                                -- draft | sent | accepted | refused | expired

  created_at      TIMESTAMPTZ   DEFAULT now()
  updated_at      TIMESTAMPTZ   DEFAULT now()

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TABLE : quote_items  (lignes du devis)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  id            UUID          PK, DEFAULT gen_random_uuid()
  quote_id      UUID          FK → quotes(id) ON DELETE CASCADE
  description   TEXT          NOT NULL     Description de la prestation/produit
  quantity      NUMERIC(10,2) DEFAULT 1
  unit_price    NUMERIC(15,2) DEFAULT 0    Prix unitaire HT
  total         NUMERIC(15,2) DEFAULT 0    Total HT ligne (quantity × unit_price)
  sort_order    INT           DEFAULT 0    Ordre d'affichage
  created_at    TIMESTAMPTZ   DEFAULT now()

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FONCTION RPC : generate_quote_number(p_user_id UUID) → TEXT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Génère automatiquement un numéro séquentiel par utilisateur.
  Format : DEV-YYYY-NNNN  (ex : DEV-2025-0042)

  CREATE OR REPLACE FUNCTION generate_quote_number(p_user_id UUID)
  RETURNS TEXT LANGUAGE plpgsql AS $$
  DECLARE
    v_year  TEXT := TO_CHAR(NOW(), 'YYYY');
    v_count INT;
  BEGIN
    SELECT COUNT(*) + 1 INTO v_count
    FROM quotes
    WHERE user_id = p_user_id
      AND TO_CHAR(created_at, 'YYYY') = v_year;
    RETURN 'DEV-' || v_year || '-' || LPAD(v_count::TEXT, 4, '0');
  END;
  $$;

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CORRESPONDANCE FORMULAIRE ↔ CHAMPS DB
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Mention légale               Champ HTML id        Colonne DB
  ─────────────────────────────────────────────────────────────────────────────
  Mot "DEVIS"                  (bandeau statique)   quote_number (prefix DEV-)
  Date de création             quoteDate            quotes.quote_date
  Nom du professionnel         proName              quotes.pro_name
  Raison sociale               proCompany           quotes.pro_company
  Adresse pro                  proAddress           quotes.pro_address
  Statut & forme juridique     proLegalForm         quotes.pro_legal_form
  N° RCCM / SIREN équivalent   proRccm              quotes.pro_rccm
  N° Contribuable / NIU        proNiu               quotes.pro_niu
  Nom du client                clientSelect         quotes.client_id → clients
  Adresse du client            clientAddress        quotes.client_address
  Date début prestation        startDate            quotes.start_date
  Durée estimée                duration             quotes.duration
  Description prestation       .description         quote_items.description
  Quantité                     .quantity            quote_items.quantity
  Prix unitaire HT             .unitPrice           quote_items.unit_price
  Coût main d'œuvre            laborCost            quotes.labor_cost
  Frais de déplacement         travelCost           quotes.travel_cost
  Montant total HT             (calculé)            quotes.total_ht
  Taux de TVA                  taxRate              quotes.tax_rate
  Montant de la TVA            (calculé)            quotes.tax_amount
  Total TTC                    (calculé)            quotes.total_amount
  Durée de validité            validityDays         quotes.validity_days
  Conditions de paiement       paymentTerms         quotes.payment_terms
  Conditions de livraison      deliveryTerms        quotes.delivery_terms
  Conditions SAV               savTerms             quotes.sav_terms
  Mention gros œuvre           checkGrosOeuvre      quotes.gros_oeuvre (BOOL)
  Nom signataire               signerName           quotes.signer_name
  Signature (canvas base64)    #sigCanvas           quotes.signature_data