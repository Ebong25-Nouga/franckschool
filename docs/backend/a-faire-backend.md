# Backend : liste de ce qu'il reste à brancher

Liste tenue à jour pendant la conception des interfaces. Chaque point a été décidé avec le propriétaire ;
l'interface existe déjà dans le frontend, avec des données ou un fonctionnement simulés.

Dernière mise à jour : 25/11/2026.

## Paiements et reçus

| # | À faire | Interface concernée | Décision |
|---|---|---|---|
| B1 | **Générer le reçu après un paiement en ligne** : numéro unique et sans trou par école (table `compteurs`), enregistrement dans `recus`, PDF avec empreinte SHA-256, envoi d'une notification au parent | Espace parent > Paiements, Reçus | 015 |
| B2 | **Brancher le paiement en ligne MTN MoMo / Orange Money** via un agrégateur camerounais (CinetPay, NotchPay, Campay… à choisir) : demande de paiement, confirmation par l'opérateur (webhook), gestion des échecs et délais | Espace parent > Payer en ligne | 015 |
| B3 | Enregistrer le paiement en ligne dans la caisse de l'école : `transactions` + `paiements` + `paiement_echeances`, référence externe unique (pas de doublon) | Caisse de l'établissement | Audit BD § 3.6 |
| B4 | Décider qui paie la commission de l'agrégateur (école ou parent) | — | À décider |
| B5 | Vrais codes marchands MoMo / Orange Money de chaque école (paramètres de l'établissement) | Espace parent, Paramètres école | À fournir |
| B6 | Téléchargement réel des reçus et des bulletins en PDF (disque privé, accès selon les droits) | Reçus, Notes et bulletins | Audit BD § 3.7 |

## Authentification

| # | À faire | Interface concernée | Décision |
|---|---|---|---|
| B7 | Connexion par e-mail **ou** numéro de téléphone, sessions Sanctum, redirection selon le rôle | Connexion | Validée |
| B8 | Mot de passe oublié par **code SMS** (6 chiffres, 10 min, 5 essais) : service SMS à choisir | Mot de passe oublié | Option A, 25/11 |
| B9 | Mot de passe oublié par **e-mail** (lien valable 60 min) | Mot de passe oublié | Validée |
| B10 | Blocage temporaire après plusieurs essais de connexion ratés | Connexion | Validée |
| B11 | Retirer les « Comptes de test » de l'écran de connexion avant la mise en production | Connexion | Gardés pour les tests |

## Accueil public

| # | À faire | Interface concernée | Décision |
|---|---|---|---|
| B12 | Formulaire « Demander une démonstration » : envoyer la demande sur le **WhatsApp** du propriétaire (lien avec message prérempli), sans stockage en base | Page d'accueil | 011 |
| B13 | Tarifs définitifs (actuellement provisoires) | Page d'accueil > Tarifs | À fournir |

## Espace parent

| # | À faire | Interface concernée | Décision |
|---|---|---|---|
| B14 | Notifications réelles (paiement reçu, nouvelles notes, retards, messages de l'école) et préférences, dont l'envoi par SMS | Notifications, Paramètres | 013 |
| B15 | Notes visibles par les parents seulement après validation par l'établissement | Notes et bulletins | 014 |
