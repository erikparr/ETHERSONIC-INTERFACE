export default class VoxView {
    constructor(two, pixiApp, pixiGraphics) {
        this.two = two;
        this.pixiApp = pixiApp;

        this.graphics = pixiGraphics;
        this.textItems = []; // Array to keep track of text items

        //load json
        this.loadData();

        // this.pixiApp.stage.addChild(this.graphics);
        this.pixiContainer = document.getElementById('pixi-container');
        this.pixiContainer.classList.toggle('hidden');


        // voxViewBt allows user to toggle between keyboard and vox instrument view
        this.voxViewBt = document.getElementById('vox-view-button');

        this.voxViewBt.addEventListener('click', () => {
            console.log('Button clicked!');  // Add this
            // Code to display the current key
            this.voxViewBt.classList.toggle('button-pressed');
            this.pixiContainer.classList.toggle('hidden');
            document.getElementById('two-0').classList.toggle('hidden');
            document.getElementsByClassName('main-ui')[0].classList.toggle('hidden');
        });
    }


    async loadData() {
        try {
            const response = await fetch('/data/align.json');
            const data = await response.json();

            this.data = data;

            // You can now use this.data in any other class methods
            // setInterval(() => {
            //     this.randomPhoneme(this.data);
            // }, 1000);
        } catch (error) {
            console.error("Error fetching the JSON data:", error);
        }
    }
    calculateTotalDuration(word, phoneIndex) {
        let totalDuration = word.start;

        for (let i = 0; i < phoneIndex; i++) {
            totalDuration += word.phones[i].duration;
        }

        return totalDuration;
    }

    randomPhoneme() {
        const json = this.data;
        // Clear any previously added text items from the stage
        for (let item of this.textItems) {
            this.pixiApp.stage.removeChild(item);
        }
        this.textItems = []; // Clear the references

        // Filter words that have "case" value "success"
        const successfulWords = json.words.filter(word => word.case === "success");

        if (successfulWords.length === 0) {
            console.warn("No words with 'success' case found.");
            return;
        }

        // 1. Randomly select a word from the filtered words list
        const randomWord = successfulWords[Math.floor(Math.random() * successfulWords.length)];

        // 2. Randomly select a phone from the phones list
        const randomPhoneIndex = Math.floor(Math.random() * randomWord.phones.length);
        const randomPhone = randomWord.phones[randomPhoneIndex];

        // Calculate the totalDuration using the new method
        const totalDuration = this.calculateTotalDuration(randomWord, randomPhoneIndex);

        // 3. Display the selected word using pixi.js in a large text (36px)
        const wordText = new PIXI.Text(randomWord.word, {
            fontFamily: 'Arial',
            fontSize: 36,
            fill: 0xFFFFFF, // white
        });
        wordText.x = this.pixiApp.screen.width / 2 - wordText.width / 2;
        wordText.y = this.pixiApp.screen.height / 2 - wordText.height / 2;
        this.pixiApp.stage.addChild(wordText);
        this.textItems.push(wordText); // Add to our text items array

        // 4. Display the phone content below the word
        const phoneTextValue = randomPhone.phone.split('_')[0];
        const phoneText = new PIXI.Text(phoneTextValue, {
            fontFamily: 'Arial',
            fontSize: 24,
            fill: 0xFFFFFF, // white
        });
        phoneText.x = this.pixiApp.screen.width / 2 - phoneText.width / 2;
        phoneText.y = wordText.y + wordText.height + 10;
        this.pixiApp.stage.addChild(phoneText);
        this.textItems.push(phoneText); // Add to our text items array

        // 5. Display the duration content and the total duration below the phone content
        const durationText = new PIXI.Text(`Duration: ${randomPhone.duration} | Total Duration: ${totalDuration}`, {
            fontFamily: 'Arial',
            fontSize: 18,
            fill: 0xFFFFFF, // white
        });
        durationText.x = this.pixiApp.screen.width / 2 - durationText.width / 2;
        durationText.y = phoneText.y + phoneText.height + 5;
        this.pixiApp.stage.addChild(durationText);
        this.textItems.push(durationText); // Add to our text items array
        return {
            phoneDuration: randomPhone.duration,
            totalDuration: totalDuration
        };
    }
}    
