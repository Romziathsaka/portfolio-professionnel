import { test } from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcryptjs";

test("Le mot de passe est correctement sécurisé", async () => {
    const motDePasse = "MonMotDePasse123";

    const motDePasseHash = await bcrypt.hash(motDePasse, 10);

    assert.notEqual(motDePasseHash, motDePasse);

    const resultat = await bcrypt.compare(motDePasse, motDePasseHash);

    assert.equal(resultat, true);
});