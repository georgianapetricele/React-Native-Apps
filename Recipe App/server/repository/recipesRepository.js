const db = require('../db/database');
const logger = require('../config/logger');
const { v4: uuidv4 } = require('uuid');

class RecipesRepository {
    async getAllRecipes() {
        logger.debug('Fetching all recipes.');
        return await db.all('SELECT * FROM recipes');
    }

    async getRecipeById(id) {
        logger.debug(`Fetching recipe by ID: ${id}`);
        return await db.get('SELECT * FROM recipes WHERE id = ?', [id]);
    }

    async addRecipe({ name, ingredients,preparationSteps,preparationTime }) {
        const id = uuidv4();

        logger.debug(`Adding recipe with ID: ${id}`);
        await db.run(
            `INSERT INTO recipes (id,name, ingredients, preparationSteps, preparationTime)
       VALUES (?,?, ?, ?, ?)`,
            [id,name,ingredients,preparationSteps,preparationTime]
        );

        return { id, name,ingredients,preparationSteps,preparationTime };
    }

    async updateRecipe(id, { name, ingredients,preparationSteps,preparationTime }) {
        logger.debug(`Updating recipe with ID: ${id}`);
        await db.run(
            `UPDATE recipes SET name = ?, ingredients = ?, preparationSteps = ?,preparationTime = ? WHERE id = ?`,
            [name, ingredients,preparationSteps,preparationTime, id]
        );

        return { id, name, ingredients,preparationSteps,preparationTime };
    }

    async deleteRecipe(id) {
        logger.debug(`Deleting recipe with ID: ${id}`);
        await db.run('DELETE FROM recipes WHERE id = ?', [id]);
    }
}

module.exports = new RecipesRepository();
