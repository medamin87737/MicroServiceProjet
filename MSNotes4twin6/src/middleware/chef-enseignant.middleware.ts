import { NextFunction, Request, Response } from 'express';

const ROLE_HEADER = 'x-enseignant-role';

function readRoleHeader(req: Request): string | undefined {
  const h = req.headers[ROLE_HEADER];
  if (Array.isArray(h)) {
    return h[0];
  }
  return h;
}

function isChef(req: Request): boolean {
  const v = readRoleHeader(req)?.trim();
  if (!v) {
    return false;
  }
  return v === 'Chef Enseignant' || v.toUpperCase() === 'CHEF_ENSEIGNANT';
}

function isEnseignant(req: Request): boolean {
  const v = readRoleHeader(req)?.trim();
  if (!v) {
    return false;
  }
  return v === 'Enseignant' || v.toUpperCase() === 'ENSEIGNANT';
}

function isEnseignantOrChef(req: Request): boolean {
  return isEnseignant(req) || isChef(req);
}

/**
 * MSNotes : sous `/notes`, l’Enseignant gère tout (GET/POST/PUT/DELETE).
 * Le Chef Enseignant n’a que la lecture (GET). `/health` et `/welcome` restent publics.
 */
export function chefEnseignantNotesMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (req.method === 'OPTIONS') {
    next();
    return;
  }
  const p = req.path ?? '';
  if (p === '/health' || p === '/welcome') {
    next();
    return;
  }
  if (!p.startsWith('/notes')) {
    next();
    return;
  }

  const method = (req.method ?? 'GET').toUpperCase();

  if (method === 'GET') {
    if (isEnseignantOrChef(req)) {
      next();
      return;
    }
    res.status(403).json({
      message:
        `Accès GET réservé à Enseignant ou Chef Enseignant. Envoyez l'en-tête X-Enseignant-Role: "Enseignant" ou "Chef Enseignant".`,
    });
    return;
  }

  // POST, PUT, DELETE, PATCH — uniquement Enseignant
  if (isEnseignant(req)) {
    next();
    return;
  }
  if (isChef(req)) {
    res.status(403).json({
      message:
        `Les écritures (POST/PUT/DELETE) sur les notes sont réservées à l'Enseignant. Le Chef Enseignant a uniquement l'accès en lecture (GET).`,
    });
    return;
  }
  res.status(403).json({
    message:
      `Réservé à l'Enseignant. Envoyez l'en-tête X-Enseignant-Role: "Enseignant" (ou ENSEIGNANT).`,
  });
}
