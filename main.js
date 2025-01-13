class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    preload() {
        this.load.image('background', 'assets/kitchen-background.jpg'); // Kitchen background
        this.load.audio('bgMusic', 'assets/background-music.mp3'); // Background music
        this.load.audio('buttonClick', 'assets/click-sound.mp3'); // Button click sound
    }

    create() {
        // Play background music
        this.backgroundMusic = this.sound.add('bgMusic', { loop: true, volume: 0.5 });
        this.backgroundMusic.play();
    
        // Set the background to cover the entire canvas
        this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'background')
            .setOrigin(0.5, 0.5)
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height);
    
        // Display title
        this.add.text(this.cameras.main.centerX, 100, 'Welcome to the Recipe Making Game!', {
            fontSize: '32px',
            fill: '#ffffff',
            fontStyle: 'bold',
            align: 'center'
        }).setOrigin(0.5);
    
        // Create buttons for recipe selection
        const recipes = ['Vegetable Pulav', 'Mutter Pulav', 'Carrot Pulav'];
    
        recipes.forEach((recipe, index) => {
            const button = this.create3DButton(this.cameras.main.centerX, 200 + index * 70, recipe);
            button.on('pointerdown', () => {
                this.playButtonClick();
                this.startCooking(recipe);
            });
        });
    
        // Create Toggle Music button (text icon)
        this.toggleMusicButton = this.add.text(this.cameras.main.centerX, 200 + recipes.length * 70 + 50, '🔊', {
            fontSize: '48px',
            fill: '#FF8C00',
            fontStyle: 'bold',
            backgroundColor: '#000',
            padding: { x: 10, y: 5 },
            borderRadius: 10
        }).setOrigin(0.5).setInteractive();
    
        this.toggleMusicButton.on('pointerdown', () => {
            this.toggleMusic();
        });
    
        // Button hover effects
        this.toggleMusicButton.on('pointerover', () => {
            this.toggleMusicButton.setStyle({ fill: '#FFDA00' });
        });
    
        this.toggleMusicButton.on('pointerout', () => {
            this.toggleMusicButton.setStyle({ fill: '#FF8C00' });
        });
    }
    

    create3DButton(x, y, text) {
        const button = this.add.text(x, y, text, {
            fontSize: '24px',
            fill: text === 'Vegetable Pulav' ? '#cc6600' : '#cc6600', // Green for Vegetable Pulav, Red for Paneer Pulav
            fontStyle: 'bold',
            backgroundColor: '#000',
            padding: { x: 10, y: 5 },
            borderRadius: 10
        }).setOrigin(0.5).setInteractive();
    
        //button.setStroke('#cc6600', 5); // Glowing border effect
    
        button.on('pointerover', () => {
            this.add.tween({
                targets: button,
                scaleX: 1.1,
                scaleY: 1.1,
                duration: 200,
                ease: 'Power1'
            });
            button.setStyle({ fill: '#ffbf80' }); // Change color to gold on hover
            //button.setShadow(5, 5, '#eedddd', 10, true, true); // Shadow effect
        });
    
        button.on('pointerout', () => {
            this.add.tween({
                targets: button,
                scaleX: 1,
                scaleY: 1,
                duration: 200,
                ease: 'Power1'
            });
            button.setStyle({ fill: text === 'Vegetable Pulav' ? '#cc6600' : '#cc6600' }); // Reset color - brown color
            button.setShadow(0, 0, '#d7a0a0', 0); // Remove shadow
        });
    
        return button;
    }
    

    startCooking(recipe) {
        let ingredients;
    
        switch (recipe) {
            case 'Vegetable Pulav':
                ingredients = ['vegetable', 'rice'];
                break;
            case 'Carrot Pulav':
                ingredients = ['carrot', 'rice'];
                break;
            case 'Mutter Pulav':
                ingredients = ['mutter', 'rice'];
                break;
            default:
                ingredients = [];
        }
    
        this.scene.start('CookingScene', { recipe, ingredients });
    }
    

    playButtonClick() {
        const clickSound = this.sound.add('buttonClick', { volume: 1.0 });
        clickSound.play();
    }

    // Function to toggle music on and off
    toggleMusic() {
        if (this.backgroundMusic.isPlaying) {
            this.backgroundMusic.pause(); // Pause music
            this.toggleMusicButton.setText('🔇'); // Update icon to mute
        } else {
            this.backgroundMusic.play(); // Play music
            this.toggleMusicButton.setText('🔊'); // Update icon to sound
        }
    }
}



class CookingScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CookingScene' });
    }

    init(data) {
        this.recipe = data.recipe;
        this.ingredients = data.ingredients; // Dynamic ingredients
    }
    
    preload() {
        this.load.image('cooking-bg', 'assets/cooking-background.jpg');

        // Load images for all ingredients and background
        this.load.image('background', 'assets/kitchen-background.jpg');
        this.load.image('vegetable', 'assets/vegetable.png');
        this.load.image('carrot', 'assets/carrot.png');  // New
        this.load.image('mutter', 'assets/mutter.png');  // New
        this.load.image('rice', 'assets/rice.png');
        this.load.image('utensil', 'assets/utensil.png');
    }
    
    create() {
        // Set the new background for the CookingScene
        this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'cooking-bg')
        .setOrigin(0.5, 0.5)
        .setDisplaySize(this.cameras.main.width, this.cameras.main.height);

        // Display recipe name
        this.add.text(this.cameras.main.centerX, 50, `Let's Make ${this.recipe}!`, {
            fontSize: '28px',
            fill: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Add utensil and ingredients
        this.utensil = this.add.image(this.cameras.main.width - 200, 300, 'utensil').setScale(0.2);
        this.droppedIngredients = {};
        this.ingredients.forEach((ingredient, index) => {
            this.createDraggableIngredient(ingredient, 150, 150 + index * 200, 0.15);
            this.droppedIngredients[ingredient] = false;
        });

        this.add.text(this.cameras.main.centerX, 500, 'Drag and drop ingredients into the utensil!', {
            fontSize: '20px',
            fill: '#ffcc00'
        }).setOrigin(0.5);
        // Set background
        this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'background')
            .setOrigin(0.5, 0.5)
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height);
    
        // Display recipe name
        this.add.text(this.cameras.main.centerX, 50, `Let's Make ${this.recipe}!`, {
            fontSize: '28px',
            fill: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
    
        // Add utensil
        this.utensil = this.add.image(this.cameras.main.width - 200, 300, 'utensil');
        this.utensil.setScale(0.2);
    
        // Track dropped ingredients
        this.droppedIngredients = {};
    
        // Dynamically create draggable ingredients
        this.ingredients.forEach((ingredient, index) => {
            this.createDraggableIngredient(ingredient, 150, 150 + index * 200, 0.15);
            this.droppedIngredients[ingredient] = false;
        });
    
        // Instructional text
        this.add.text(this.cameras.main.centerX, 500, 'Drag and drop ingredients into the utensil!', {
            fontSize: '20px',
            fill: '#ffcc00'
        }).setOrigin(0.5);
    }
    

    createDraggableIngredient(key, x, y, scale) {
        const ingredient = this.add.sprite(x, y, key).setInteractive();
        ingredient.setScale(scale);

        this.input.setDraggable(ingredient);

        // Event listeners for dragging
        ingredient.on('dragstart', () => {
            ingredient.setAlpha(0.7); // Make semi-transparent when dragging
        });

        ingredient.on('drag', (pointer, dragX, dragY) => {
            ingredient.x = dragX;
            ingredient.y = dragY;
        });

        ingredient.on('dragend', () => {
            ingredient.setAlpha(1); // Reset transparency

            // Check if dropped near the utensil
            const distance = Phaser.Math.Distance.Between(
                ingredient.x, ingredient.y,
                this.utensil.x, this.utensil.y
            );

            if (distance < 50) { // If close to the utensil
                ingredient.x = this.utensil.x;
                ingredient.y = this.utensil.y;
                ingredient.setAlpha(0.5); // Make semi-transparent to show it's added

                // Mark ingredient as dropped
                this.droppedIngredients[key] = true;

                // Check if all ingredients are dropped
                this.checkAllIngredientsDropped();
            }
        });
    }

    checkAllIngredientsDropped() {
        const allDropped = Object.values(this.droppedIngredients).every(status => status);

        if (allDropped) {
            // Transition to ResultScene with a success message
            this.scene.start('ResultScene', { message: 'Congratulations! Your dish is ready!' });
        }
    }
}

class ResultScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ResultScene' });
    }

    init(data) {
        this.message = data.message;
    }

    preload() {
        this.load.image('background', 'assets/kitchen-background.jpg'); // Kitchen background
        this.load.audio('bgMusic', 'assets/background-music.mp3'); // Background music
    }

    create() {
        // Set the background to cover the entire canvas
        this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'background')
            .setOrigin(0.5, 0.5)
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height);

        // Display result message
        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 50, this.message, {
            fontSize: '28px',
            fill: '#fff',
            fontStyle: 'bold',
            align: 'center'
        }).setOrigin(0.5);

        // Create a "Play Again" button
        const playAgainButton = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 50, 'Play Again', {
            fontSize: '24px',
            fill: '#ffcc00',
            backgroundColor: '#000',
            padding: { x: 10, y: 5 },
            borderRadius: 5,
        }).setInteractive().setOrigin(0.5);

        // Stop background music and restart the game
        playAgainButton.on('pointerdown', () => {
            this.sound.stopAll(); // Stop all sounds, including music
            this.scene.start('MenuScene'); // Restart the game by going back to the menu
        });

        // Add hover effect for button
        playAgainButton.on('pointerover', () => {
            playAgainButton.setStyle({ fill: '#fff', backgroundColor: '#ffcc00' });
        });
        playAgainButton.on('pointerout', () => {
            playAgainButton.setStyle({ fill: '#ffcc00', backgroundColor: '#000' });
        });
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,  // Match the container's width
    height: 600, // Match the container's height
    parent: 'game-container',  // Attach the canvas to the container
    scene: [MenuScene, CookingScene, ResultScene],
    scale: {
        mode: Phaser.Scale.FIT,  // Ensure the canvas fits within the container
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

const game = new Phaser.Game(config);
