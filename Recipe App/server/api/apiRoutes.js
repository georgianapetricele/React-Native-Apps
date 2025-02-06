const express = require('express');
const recipesRepository = require('../repository/recipesRepository');
const logger = require('../config/logger');
const WebSocketService = require('../services/websocketService');

const router = express.Router();

router.get('/recipes', async (req, res) => {
    try {
        logger.debug('API: Fetching all recipes');
        const recipes = await recipesRepository.getAllRecipes();
        res.json(recipes);
    } catch (error) {
        logger.error('Error fetching recipes:', error.message);
        res.status(500).json({ error: error.message });
    }
});

router.get('/recipes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        logger.debug(`API: Fetching recipe with ID: ${id}`);
        const recipe = await recipesRepository.getRecipeById(id);
        if (!recipe) {
            return res.status(404).json({ error: 'Recipe not found' });
        }
        res.json(recipe);
    } catch (error) {
        logger.error('Error fetching recipe by ID:', error.message);
        res.status(500).json({ error: error.message });
    }
});

router.post('/recipes', async (req, res) => {
    try {
        const { name, ingredients,preparationSteps,preparationTime } = req.body;
        console.log('body',req.body);
        logger.debug('API: Adding a new recipe');
        const newRecipe = await recipesRepository.addRecipe({name, ingredients,preparationSteps,preparationTime });

        WebSocketService.broadcast({ type: 'NEW_RECIPE', data: newRecipe });

        res.status(201).json(newRecipe);
    } catch (error) {
        logger.error('Error adding recipe:', error.message);
        res.status(500).json({ error: error.message });
    }
});

router.put('/recipes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {name, ingredients,preparationSteps,preparationTime } = req.body;
        logger.debug(`API: Updating recipe with ID: ${id}`);
        const updatedRecipe = await recipesRepository.updateRecipe(id, { name, ingredients,preparationSteps,preparationTime });

        WebSocketService.broadcast({ type: 'UPDATE_RECIPE', data: updatedRecipe });

        res.json(updatedRecipe);
    } catch (error) {
        logger.error('Error updating recipe:', error.message);
        res.status(500).json({ error: error.message });
    }
});

router.delete('/recipes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        logger.debug(`API: Deleting recipe with ID: ${id}`);
        await recipesRepository.deleteRecipe(id);

        WebSocketService.broadcast({ type: 'DELETE_RECIPE', data: { id } });

        res.json({ message: 'Recipe deleted successfully' });
    } catch (error) {
        logger.error('Error deleting recipe:', error.message);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
