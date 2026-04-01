## API Endpoints (Microservices + API Gateway)

Cette documentation recense les endpoints REST exposés par les microservices et accessibles via l’API Gateway.

### Infrastructure
- **Eureka (Registry)**: http://localhost:8761
- **API Gateway**: http://localhost:8087
- **Front (proxy vers Gateway)**: http://localhost:3000
  - Proxy Next.js: `http://localhost:3000/api/:path*` → `http://localhost:8087/:path*`

---

### Règles générales
- Format JSON pour les corps de requêtes/retours.
- Modèle simple commun (selon services) pour les créations/mises à jour:
```json
{
  "nom": "string",
  "description": "string"
}
```

---

### Étudiants
- Service: `MSEtudiant4twin6`
- Port direct: `http://localhost:8082`
- Base path: `/etudiants`
- Endpoints:
  - `GET /etudiants` → lister
  - `GET /etudiants/{id}` → détails
  - `POST /etudiants` → créer
  - `PUT /etudiants/{id}` → modifier
  - `DELETE /etudiants/{id}` → supprimer
- Via Gateway: `http://localhost:8087/etudiants/...`
- Via Front: `http://localhost:3000/api/etudiants/...`

---

### Enseignants
- Service: `MSEnseignant4twin6`
- Port direct: `http://localhost:8083`
- Base path: `/enseignants`
- Endpoints:
  - `GET /enseignants` → lister
  - `GET /enseignants/{id}` → détails
  - `POST /enseignants` → créer
  - `PUT /enseignants/{id}` → modifier
  - `DELETE /enseignants/{id}` → supprimer
- Via Gateway: `http://localhost:8087/enseignants/...`
- Via Front: `http://localhost:3000/api/enseignants/...`

---

### Classes
- Service: `MSClasse4twin6`
- Port direct: `http://localhost:8084`
- Base path: `/classes`
- Endpoints:
  - `GET /classes` → lister
  - `GET /classes/{id}` → détails
  - `POST /classes` → créer
  - `PUT /classes/{id}` → modifier
  - `DELETE /classes/{id}` → supprimer
- Via Gateway: `http://localhost:8087/classes/...`
- Via Front: `http://localhost:3000/api/classes/...`

---

### Matières
- Service: `MSMatiere4twin6`
- Port direct: `http://localhost:8085`
- Base path: `/matieres`
- Endpoints:
  - `GET /matieres` → lister
  - `GET /matieres/{id}` → détails
  - `POST /matieres` → créer
  - `PUT /matieres/{id}` → modifier
  - `DELETE /matieres/{id}` → supprimer
- Via Gateway: `http://localhost:8087/matieres/...`
- Via Front: `http://localhost:3000/api/matieres/...`

---

### Salles
- Service: `MSSalle4twin6`
- Port direct: `http://localhost:8086`
- Base path: `/salles`
- Endpoints:
  - `GET /salles` → lister
  - `GET /salles/{id}` → détails
  - `POST /salles` → créer
  - `PUT /salles/{id}` → modifier
  - `DELETE /salles/{id}` → supprimer
- Via Gateway: `http://localhost:8087/salles/...`
- Via Front: `http://localhost:3000/api/salles/...`

---

### Notes
- Utiliser de préférence l’API Gateway depuis le front pour éviter tout souci CORS et bénéficier de la découverte Eureka.
- Les ports directs des microservices sont utiles pour du debug local uniquement.
