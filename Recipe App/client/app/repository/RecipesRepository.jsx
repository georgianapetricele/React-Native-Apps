import AsyncStorage from "@react-native-async-storage/async-storage";

class RecipesRepository {
  constructor() {
    this.apiBaseUrl = "http://192.168.0.169:3000/recipes";
    this.socket = null;
    this.isOnline = true;
    this.pendingOperationsKey = "PENDING_OPERATIONS";
    this.localRecipesKey = "LOCAL_RECIPES";
  }

  async initWebSocket() {
    if (this.socket) {
      return;
    }

    console.debug("Initializing WebSocket connection...");
    this.socket = new WebSocket("ws://192.168.0.169:3000");

    this.socket.onopen = async () => {
      console.debug("WebSocket connection established.");
      this.showErrorMessage("Connected to the server. Online mode on");
      this.isOnline = true;
      await this.syncPendingOperations();
    };

    this.socket.onerror = () => {
      this.isOnline = false;
      this.showErrorMessage(
        "Unable to connect to the server. Local sync mode on"
      );
    };

    this.socket.onclose = () => {
      console.debug("WebSocket connection closed:");
      this.isOnline = false;
      this.socket = null;
    };
  }

  showErrorMessage(message) {
    alert(message);
  }

  async getLocalRecipes() {
    const localData = await AsyncStorage.getItem(this.localRecipesKey);
    return localData ? JSON.parse(localData) : [];
  }

  async saveLocalRecipes(recipes) {
    await AsyncStorage.setItem(this.localRecipesKey, JSON.stringify(recipes));
  }

  async addPendingOperation(operation) {
    const pendingOps = await this.getPendingOperations();
    pendingOps.push(operation);
    await AsyncStorage.setItem(
      this.pendingOperationsKey,
      JSON.stringify(pendingOps)
    );
  }

  async getPendingOperations() {
    const ops = await AsyncStorage.getItem(this.pendingOperationsKey);
    return ops ? JSON.parse(ops) : [];
  }

  async clearPendingOperations() {
    await AsyncStorage.removeItem(this.pendingOperationsKey);
  }

  async replaceLocalRecipeId(localId, serverId) {
    const localRecipes = await this.getLocalRecipes();

    const index = localRecipes.findIndex(
      (recipe) => recipe.localId === localId
    );
    if (index >= 0) {
      localRecipes[index].id = serverId;
      delete localRecipes[index].localId;
      await this.saveLocalRecipes(localRecipes);
    }
  }

  async syncPendingOperations() {
    const pendingOps = await this.getPendingOperations();

    for (const op of pendingOps) {
      try {
        if (op.type === "ADD") {
          const response = await fetch(`${this.apiBaseUrl}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(op.data),
          });

          if (!response.ok) throw new Error("Failed to sync ADD operation.");

          const savedRecipe = await response.json();
          await this.replaceLocalRecipeId(op.data.localId, savedRecipe.id);
        } else if (op.type === "UPDATE") {
          await this.updateRecipe(op.data.id, op.data, true);
        } else if (op.type === "DELETE") {
          await this.deleteRecipe(op.data.id, true);
        }
      } catch (error) {
        console.error("Error syncing operation:", error);
      }
    }

    await this.clearPendingOperations();
  }

  async getAllRecipes() {
    try {
      if (this.isOnline) {
        console.debug("Fetching recipes from server...");
        const response = await fetch(`${this.apiBaseUrl}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) throw new Error("Failed to fetch recipes.");

        const recipes = await response.json();
        await this.saveLocalRecipes(recipes);
        return recipes;
      } else {
        this.showErrorMessage("You are offline. Displaying local data.");
        console.debug("Fetching recipes from local...");
        return await this.getLocalRecipes();
      }
    } catch (error) {
      console.error("Error fetching recipes:", error);
      return await this.getLocalRecipes();
    }
  }

  async addRecipe(recipe, isSyncing = false) {
    if (this.isOnline || isSyncing) {
      console.debug("Adding recipe to server...");
      const response = await fetch(`${this.apiBaseUrl}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(recipe),
      });
      if (!response.ok) throw new Error("Failed to add recipe.");
    } else {
      console.debug("Adding recipe to local database...");
      await this.addPendingOperation({ type: "ADD", data: recipe });
      recipe.id = this.generateRandomId().toString();
    }
    const localRecipes = await this.getLocalRecipes();
    localRecipes.push(recipe);
    await this.saveLocalRecipes(localRecipes);
  }

  generateRandomId() {
    return Math.floor(Math.random() * 1000000);
  }

  async updateRecipe(id, updatedRecipe, isSyncing = false) {
    if (this.isOnline || isSyncing) {
      console.debug("Updating recipe from server...");
      const response = await fetch(`${this.apiBaseUrl}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedRecipe),
      });
      if (!response.ok) throw new Error("Failed to update recipe.");
    } else {
      console.debug("Updating recipe from local storage...");
      await this.addPendingOperation({
        type: "UPDATE",
        data: { id, ...updatedRecipe },
      });
    }
    const localRecipes = await this.getLocalRecipes();
    const index = localRecipes.findIndex((recipe) => recipe.id === id);
    if (index >= 0) {
      localRecipes[index] = { ...localRecipes[index], ...updatedRecipe };
      await this.saveLocalRecipes(localRecipes);
    }
  }

  async deleteRecipe(id, isSyncing = false) {
    if (this.isOnline || isSyncing) {
      console.debug("Deleting recipe from server...");
      const response = await fetch(`${this.apiBaseUrl}/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete recipe.");
    } else {
      console.debug("Deleting recipe from local storage...");
      await this.addPendingOperation({ type: "DELETE", data: { id } });
    }

    const localRecipes = await this.getLocalRecipes();
    const updatedRecipes = localRecipes.filter((recipe) => recipe.id !== id);
    await this.saveLocalRecipes(updatedRecipes);
  }

  async getRecipeById(id) {
    try {
      const parsedId = Number(id);
      if (this.isOnline) {
        console.debug("Fetching recipe from server...");
        const response = await fetch(`${this.apiBaseUrl}/${id}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) throw new Error("Failed to fetch recipe.");

        const recipe = await response.json();
        return recipe;
      } else {
        console.debug("Fetching recipe from local storage...");
        const localRecipes = await this.getLocalRecipes();
        const recipe = localRecipes.find((recipe) => recipe.id === id);
        return recipe || null;
      }
    } catch (error) {
      console.error("Error fetching recipe:", error);
      return null;
    }
  }
}

export default new RecipesRepository();
