"use strict";

/**
 * @type {GameState}
 */
let gameState;
/**
 * @type {string}
 */
let answer = "";
/**
 * @type {string[]}
 */
let revealedLetters = [];
/**
 * @type {string[]}
 */
let mistakeLetters = [];
/**
 * @type {boolean}
 */
let isMistakingNow = false;
/**
 * @type {number}
 */
const maxAnswerLength = 20;
/**
 * @type {InputController}
 */
let inputController;
/**
 * @type {CanvasRenderer}
 */
let canvasRenderer;

onload = function () {
    inputController = new InputController();
    canvasRenderer = new CanvasRenderer();

    gameState = new PressAnyKeyGameState();

    const alphabets = Array.from(document.getElementsByClassName('alphabet'));

    alphabets.forEach((a) => {
        a.addEventListener('touchstart', function (e) {
            e.preventDefault();
            inputController.inputAlphabet(a.id);
        });
        a.addEventListener('mousedown', function (e) {
            e.preventDefault();
            inputController.inputAlphabet(a.id);
        });
    })

    const del = document.getElementById("delete");
    del.addEventListener('touchstart', function (e) {
        e.preventDefault();
        inputController.inputDelete();
    });
    del.addEventListener('mousedown', function (e) {
        e.preventDefault();
        inputController.inputDelete();
    });

    const ent = document.getElementById("enter");
    ent.addEventListener('touchstart', function (e) {
        e.preventDefault();
        inputController.inputEnter();
    });
    ent.addEventListener('mousedown', function (e) {
        e.preventDefault();
        inputController.inputEnter();
    });

    onkeydown = e => inputController.inputKeyboard(e);
}

class InputController {
    /**
     * This method is triggered by a "mousedown" or "touchstart" event from alphabet HTMLElements, and invokes the current GameState's handleInput method.
     * If the GameState returns true, this method changes the alphabet HTMLElement's color.
     * @param {string} alphabet 
     */
    inputAlphabet(alphabet) {
        const key = document.getElementById(alphabet);
        if (key) {
            if (gameState.handleInputAlphabet(alphabet)) {
                key.style.backgroundColor = "#000000";
                key.style.color = "#ffffff";
                setTimeout(function () {
                    key.style.backgroundColor = "#ffffff";
                    key.style.color = "#000000";
                }, 100);
            }
        }
    }
    /**
     * This method is triggered by a "mousedown" or "touchstart" event from delete HTMLElements, and invokes the current GameState's handleInput method.
     * If the GameState returns true, this method changes the delete HTMLElement's color.
     */
    inputDelete() {
        if (gameState.handleInputDelete()) {
            const key = document.getElementById("delete");
            key.style.backgroundColor = "#ffffff";
            setTimeout(function () {
                key.style.backgroundColor = "#c20b0b";
            }, 100);
        }
    }
    /**
     * This method is triggered by a "mousedown" or "touchstart" event from enter HTMLElements, and invokes the current GameState's handleInput method.
     * If the GameState returns true, this method changes the enter HTMLElement's color.
     */
    inputEnter() {
        if (gameState.handleInputEnter()) {
            const key = document.getElementById("enter");
            key.style.backgroundColor = "#ffffff";
            setTimeout(function () {
                key.style.backgroundColor = "#06d003";
            }, 100);
        }
    }
    /**
     * This method receives a KeyboardEvent from a real keyboard and sends it to an appropriate method of this InputController.
     * The InputController behaves as if the screen key is pressed.
     * @param {KeyboardEvent} e 
     */
    inputKeyboard(e) {
        switch (e.key) {
            case "a": case "b": case "c": case "d": case "e": case "f": case "g": case "h": case "i": case "j": case "k": case "l": case "m": case "n": case "o": case "p": case "q": case "r": case "s": case "t": case "u": case "v": case "w": case "x": case "y": case "z":
                this.inputAlphabet(e.key);
                break;
            case "Delete": case "Backspace":
                this.inputDelete();
                break;
            case "Enter":
                this.inputEnter();
                break;
        }
    }
}

class CanvasRenderer {
    /**
     * @type {CanvasRenderingContext2D}
     */
    #ctx = document.getElementById("field").getContext("2d");
    /**
     * @type {number}
     */
    #width = 300;
    /**
     * @type {number}
     */
    #height = 300;
    /**
     * @type {number}
     */
    #answerFontSize = 0;
    /**
     * @type {Vegetable[]}
     */
    #vegetables = [];
    /**
     * @type {Gumbo[]}
     */
    #gumbos = [];
    /**
     * @type {HangingGumbo}
     */
    #hangingGumbo;
    /**
     * @type {number}
     */
    #gumboAnimationId = 0;
    /**
     * @type {number}
     */
    #gumboAnimationCounter = 0;
    /**
     * @type {number}
     */
    #timerId;
    /**
     * @type {boolean}
     */
    #simpleAnimationCounter = true;
    /**
     * @type {(RouteLineInformation|HangNinjinImageInformation)[]}
     */
    #routeInfos = [
        new RouteLineInformation(250, 200, 50, 200),
        new RouteLineInformation(80, 200, 80, 50),
        new RouteLineInformation(50, 50, 190, 50),
        new RouteLineInformation(190, 50, 190, 80),
        new HangNinjinImageInformation(0),
        new HangNinjinImageInformation(1),
        new HangNinjinImageInformation(2),
        new HangNinjinImageInformation(3),
        new HangNinjinImageInformation(4),
        new HangNinjinImageInformation(5),
    ];
    /**
     * Resets the canvas as a pure white canvas.
     */
    resetCanvas() {
        this.#ctx.fillStyle = "#ffffff";
        this.#ctx.fillRect(0, 0, this.#width, this.#height);
    }
    /**
     * Starts the animation for PressAnyKeyGameState
     */
    startPressAnyKeyAnimation() {
        const renderer = this;
        this.#timerId = setInterval(function () {
            if (renderer.#simpleAnimationCounter) {
                const confirmMessage = "PRESS ANY KEY";
                renderer.#ctx.font = "32px 'Times New Roman'";
                const textWidth = renderer.#ctx.measureText(confirmMessage).width;
                renderer.#ctx.fillStyle = "#000000";
                renderer.#ctx.fillText(confirmMessage, (renderer.#width / 2) - (textWidth / 2), Math.floor(renderer.#height / 2));
            } else {
                renderer.resetCanvas();
            }
            renderer.#simpleAnimationCounter = !renderer.#simpleAnimationCounter;
        }, 750);
    }
    /**
     * Stops the animation for PressAnyKeyGameState
     */
    stopPressAnyKeyAnimation() {
        clearInterval(this.#timerId);
        this.#timerId = undefined;
        this.resetCanvas();
    }
    /**
     * Renders the canvas for InputGameState
     */
    renderAnswerInput() {
        this.resetCanvas();
        this.#answerFontSize = Math.floor(this.#width / 5) - answer.length;
        this.#setAnswerFont();
        let textWidth = this.#ctx.measureText(answer).width;
        while (textWidth >= this.#width - 30) {
            if (this.#answerFontSize-- <= 1) {
                this.#answerFontSize == 1;
                break;
            }
            this.#setAnswerFont();
            textWidth = this.#ctx.measureText(answer).width;
        }
        this.#ctx.fillText(answer, (this.#width / 2) - (textWidth / 2), (this.#height / 2) - (this.#answerFontSize / 2));
    }
    /**
     * Sets the font for writing the answer.
     */
    #setAnswerFont() {
        this.#ctx.font = this.#answerFontSize + "px 'Courier'";
        this.#ctx.fillStyle = "#000000";
    }
    /**
     * Renders the canvas for ConfirmGameState.
     */
    renderConfirmInput() {
        this.renderAnswerInput();
        const confirmMessage = "Play with this word?";
        this.#ctx.font = "30px 'Times New Roman'";
        const textWidth = this.#ctx.measureText(confirmMessage).width;
        this.#ctx.fillStyle = "#000000";
        this.#ctx.fillText(confirmMessage, (this.#width / 2) - (textWidth / 2), Math.floor(this.#height / 4 * 3));
    }
    /**
     * Plants Vegetables which have a letter based on the answer.
     */
    #plantVegetables() {
        this.#setAnswerFont();
        const textWidth = this.#ctx.measureText(answer).width;
        const size = textWidth / answer.length;
        for (let i = 0; i < answer.length; i++) {
            const x = (this.#width - textWidth) / 2 + size * i - 10;
            const y = this.#height - 50;
            this.#vegetables.push(new Vegetable(x, y, answer.charAt(i), size));
        }
    }
    /**
     * Draws a Gumbo in a proper position with a good animation.
     * @param {Gumbo} gumbo 
     */
    #drawGumboAnimation(gumbo) {
        this.#ctx.drawImage(Gumbo.animations[this.#gumboAnimationId], gumbo.x, gumbo.y);
    }
    /**
     * Draws a surprised Gumbo in a proper position.
     * @param {Gumbo} gumbo 
     */
    #drawSurprisedGumbo(gumbo) {
        this.#ctx.drawImage(Gumbo.supriseImage, gumbo.x, gumbo.y);
    }
    /**
     * Draws a HangingGumbo in a proper position with a good animation.
     * @param {HangingGumbo} gumbo 
     */
    #drawHangingGumboAnimation(gumbo) {
        this.#ctx.drawImage(HangingGumbo.animations[this.#gumboAnimationId], gumbo.x - 25, gumbo.y - 25, 50, 50);
    }
    /**
     * Increments #gumboAnimationCounter and if it exceeds the certain number, increments #gumboAnimationId.
     */
    #incrementGumboAnimationConter() {
        if (this.#gumboAnimationCounter++ >= 2) {
            this.#gumboAnimationCounter = 0;
            this.#gumboAnimationId = (this.#gumboAnimationId + 1) % Gumbo.animations.length;
        }
    }
    /**
     * Renders the canvas with animations for GuessingGameState.
     */
    startGuessing() {
        this.#plantVegetables();
        this.resetCanvas();
        this.#drawVegetables();
    }
    /**
     * This private method would start an animation setInterval if the #timerId is undefined.
     * When all the Gumbos end their movements, then clear the interval and make the #timerId undefined.  
     * @returns {void}
     */
    #guessingAnimation() {
        if (this.#timerId) {
            return;
        }
        const renderer = this;

        this.#timerId = setInterval(function () {
            renderer.#gumbos.forEach(g => {
                g.x -= 10;
                renderer.#vegetables.forEach((v, i) => {
                    if (g.x < v.x) {
                        if (!g.gumboCheckHistory[i]) {
                            g.gumboCheckHistory[i] = true;
                            if (v.alphabet == g.alphabet) {
                                v.reveal();
                            }
                        }
                    }
                });
            });

            renderer.resetCanvas();
            renderer.#incrementGumboAnimationConter();
            if (isMistakingNow && renderer.#hangingGumbo) {
                renderer.#ctx.strokeStyle = "#333333";
                renderer.#ctx.lineWidth = 7;
                renderer.#ctx.lineCap = "round";
    
                if (renderer.#hangingGumbo.info instanceof RouteLineInformation) {
                    if (renderer.#hangingGumbo.info.isHorizontal) {
                        renderer.#hangingGumbo.x += renderer.#hangingGumbo.speed;
                        if (renderer.#hangingGumbo.speed > 0) {
                            if (renderer.#hangingGumbo.x > renderer.#hangingGumbo.info.lineStartX) {
                                if (renderer.#hangingGumbo.x < renderer.#hangingGumbo.info.lineEndX) {
                                    renderer.#ctx.beginPath();
                                    renderer.#ctx.moveTo(renderer.#hangingGumbo.info.lineStartX, renderer.#hangingGumbo.info.lineStartY);
                                    renderer.#ctx.lineTo(renderer.#hangingGumbo.x, renderer.#hangingGumbo.y);
                                    renderer.#ctx.stroke();
                                } else {
                                    renderer.#ctx.beginPath();
                                    renderer.#ctx.moveTo(renderer.#hangingGumbo.info.lineStartX, renderer.#hangingGumbo.info.lineStartY);
                                    renderer.#ctx.lineTo(renderer.#hangingGumbo.info.lineEndX, renderer.#hangingGumbo.info.lineEndY);
                                    renderer.#ctx.stroke();
                                }
                            }
                        } else {
                            if (renderer.#hangingGumbo.x < renderer.#hangingGumbo.info.lineStartX) {
                                if (renderer.#hangingGumbo.x > renderer.#hangingGumbo.info.lineEndX) {
                                    renderer.#ctx.beginPath();
                                    renderer.#ctx.moveTo(renderer.#hangingGumbo.info.lineStartX, renderer.#hangingGumbo.info.lineStartY);
                                    renderer.#ctx.lineTo(renderer.#hangingGumbo.x, renderer.#hangingGumbo.y);
                                    renderer.#ctx.stroke();
                                } else {
                                    renderer.#ctx.beginPath();
                                    renderer.#ctx.moveTo(renderer.#hangingGumbo.info.lineStartX, renderer.#hangingGumbo.info.lineStartY);
                                    renderer.#ctx.lineTo(renderer.#hangingGumbo.info.lineEndX, renderer.#hangingGumbo.info.lineEndY);
                                    renderer.#ctx.stroke();
                                }
                            }
                        }
                    } else {
                        renderer.#hangingGumbo.y += renderer.#hangingGumbo.speed;
                        if (renderer.#hangingGumbo.speed > 0) {
                            if (renderer.#hangingGumbo.y > renderer.#hangingGumbo.info.lineStartY) {
                                if (renderer.#hangingGumbo.y < renderer.#hangingGumbo.info.lineEndY) {
                                    renderer.#ctx.beginPath();
                                    renderer.#ctx.moveTo(renderer.#hangingGumbo.info.lineStartX, renderer.#hangingGumbo.info.lineStartY);
                                    renderer.#ctx.lineTo(renderer.#hangingGumbo.x, renderer.#hangingGumbo.y);
                                    renderer.#ctx.stroke();
                                } else {
                                    renderer.#ctx.beginPath();
                                    renderer.#ctx.moveTo(renderer.#hangingGumbo.info.lineStartX, renderer.#hangingGumbo.info.lineStartY);
                                    renderer.#ctx.lineTo(renderer.#hangingGumbo.info.lineEndX, renderer.#hangingGumbo.info.lineEndY);
                                    renderer.#ctx.stroke();
                                }
                            }
                        } else {
                            if (renderer.#hangingGumbo.y < renderer.#hangingGumbo.info.lineStartY) {
                                if (renderer.#hangingGumbo.y > renderer.#hangingGumbo.info.lineEndY) {
                                    renderer.#ctx.beginPath();
                                    renderer.#ctx.moveTo(renderer.#hangingGumbo.info.lineStartX, renderer.#hangingGumbo.info.lineStartY);
                                    renderer.#ctx.lineTo(renderer.#hangingGumbo.x, renderer.#hangingGumbo.y);
                                    renderer.#ctx.stroke();
                                } else {
                                    renderer.#ctx.beginPath();
                                    renderer.#ctx.moveTo(renderer.#hangingGumbo.info.lineStartX, renderer.#hangingGumbo.info.lineStartY);
                                    renderer.#ctx.lineTo(renderer.#hangingGumbo.info.lineEndX, renderer.#hangingGumbo.info.lineEndY);
                                    renderer.#ctx.stroke();
                                }
                            }
                        }
                    }
                } else if (renderer.#hangingGumbo.info instanceof HangNinjinImageInformation) {
                    renderer.#hangingGumbo.y += renderer.#hangingGumbo.speed;
                    renderer.#ctx.drawImage(HangNinjinImageInformation.gradualImages[renderer.#hangingGumbo.info.id], 139, 78);
                    renderer.#ctx.fillStyle = "#ffffff";
                    renderer.#ctx.fillRect(0, renderer.#hangingGumbo.y, 300, 300 - renderer.#hangingGumbo.y);
                }

                if (renderer.#hangingGumbo.x < -60 || renderer.#hangingGumbo.x > 360 || renderer.#hangingGumbo.y < -60 || renderer.#hangingGumbo.y > 360) {
                    isMistakingNow = false;
                    renderer.#hangingGumbo = undefined;
                }
            }

            renderer.#drawHangNinjin();
            renderer.#drawVegetables();
            if (renderer.#hangingGumbo) {
                renderer.#drawHangingGumboAnimation(renderer.#hangingGumbo);
            }
            renderer.#gumbos.forEach(g => renderer.#drawGumboAnimation(g));
            const filteredGumbos = renderer.#gumbos.filter(g => g.x >= -60);
            renderer.#gumbos = filteredGumbos;

            if (renderer.#gumbos.length == 0 && !isMistakingNow) {
                clearInterval(renderer.#timerId);
                renderer.#timerId = undefined;
            }
        }, 50);
    }
    /**
     * Mistake! Then draw the HangNinjin!
     * (This method wold be called by GuessingGameState)
     */
    drawHangNinjinAnimation() {
        this.#hangingGumbo = new HangingGumbo(this.#routeInfos[mistakeLetters.length - 1]);
        this.#guessingAnimation();
    }
    /**
     * Draws the HangNinjin depending on the number of mistakes.
     */
    #drawHangNinjin() {
        /**
         * @type {number}
         */
        let howMany = mistakeLetters.length;

        if (isMistakingNow) {
            howMany -= 1;
        }

        this.#ctx.strokeStyle = "#333333";
        this.#ctx.lineWidth = 7;
        this.#ctx.lineCap = "round";

        /**
         * @type {number}
         */
        let id = -1;

        for (let i = 0; i < howMany; i++) {
            const info = this.#routeInfos[i];
            if (info instanceof RouteLineInformation) {
                this.#ctx.beginPath();
                this.#ctx.moveTo(info.lineStartX, info.lineStartY);
                this.#ctx.lineTo(info.lineEndX, info.lineEndY);
                this.#ctx.stroke();
            } else if (info instanceof HangNinjinImageInformation) {
                id++;
            }
        }
        if (id >= 0) {
            this.#ctx.drawImage(HangNinjinImageInformation.gradualImages[id], 139, 78);
        }
    }
    /**
     * Good choice!! Then reveal the letter!
     * (This method wold be called by GuessingGameState)
     * @param {string} alphabet 
     */
    revealLetterAnimation(alphabet) {
        this.#gumbos.push(new Gumbo(this.#width + 50, this.#height - 48, alphabet, new Array(this.#vegetables.length)));
        this.#guessingAnimation();
    }
    /**
     * Congratulations!! Gumbos would dance excitedly!!
     * (This method wold be called by CongratulationsGameState)
     */
    gameClearAnimation() {
        const renderer = this;
        const semiTimerId = setInterval(function () {
            //First wait until the guessing ainimation is ended.
            if (!renderer.#timerId) {
                clearInterval(semiTimerId);
                const earthLevelY = 153;
                const gumbo1 = new Gumbo(-180, earthLevelY, "Congratulations!", []);
                const gumbo2 = new Gumbo(-120, earthLevelY, "Congratulations!", []);
                const gumbo3 = new Gumbo(-60, earthLevelY, "Congratulations!", []);
                const gumboDancers = [gumbo1, gumbo2, gumbo3];

                //Then the ANIMATION!!
                renderer.#timerId = setInterval(function () {
                    renderer.resetCanvas();
                    renderer.#drawHangNinjin();
                    renderer.#drawVegetables();
                    gumboDancers.forEach(g => g.x += 5);
                    gumboDancers.forEach(g => renderer.#drawGumboAnimation(g));
                    renderer.#incrementGumboAnimationConter();
                    if (gumbo3.x >= 180) {
                        clearInterval(renderer.#timerId);
                        /**
                         * @type {number}
                         */
                        let animationCounter = 0;
                        /**
                         * @type {number}
                         */
                        let gumbo1Speed = -20;
                        /**
                         * @type {number}
                         */                        
                        let gumbo2Speed = -20;
                        /**
                         * @type {number}
                         */                        
                        let gumbo3Speed = -20;
                        /**
                         * @type {boolean}
                         */
                        let isRevealedCongrats = false;

                        renderer.#timerId = setInterval(function () {
                            renderer.resetCanvas();
                            renderer.#drawHangNinjin();
                            renderer.#drawVegetables();

                            if (isRevealedCongrats) {
                                const confirmMessage = "CONGRATULATIONS!!";
                                renderer.#ctx.font = "32px 'Impact'";
                                const textWidth = renderer.#ctx.measureText(confirmMessage).width;
                                renderer.#ctx.fillStyle = "#ff3333";
                                renderer.#ctx.fillText(confirmMessage, (renderer.#width / 2) - (textWidth / 2), 42);
    
                            }

                            animationCounter++;
                            if (animationCounter == 6 || animationCounter == 12) {
                                renderer.#incrementGumboAnimationConter();
                                renderer.#incrementGumboAnimationConter();
                                renderer.#incrementGumboAnimationConter();
                            }

                            if (animationCounter <= 24) {
                                gumboDancers.forEach(g => renderer.#drawGumboAnimation(g));
                            } else {
                                if (animationCounter > 24) {
                                    isRevealedCongrats = true;
                                    gumbo1.y += gumbo1Speed;
                                    gumbo1Speed += 3;
                                    if (gumbo1.y >= earthLevelY) {
                                        gumbo1.y = earthLevelY;
                                        gumbo1Speed = 0;
                                        renderer.#drawGumboAnimation(gumbo1);
                                    } else {
                                        renderer.#drawSurprisedGumbo(gumbo1);
                                    }
                                }
                                if (animationCounter > 30) {
                                    gumbo2.y += gumbo2Speed;
                                    gumbo2Speed += 3;
                                    if (gumbo2.y >= earthLevelY) {
                                        gumbo2.y = earthLevelY;
                                        gumbo2Speed = 0;
                                        renderer.#drawGumboAnimation(gumbo2);
                                    } else {
                                        renderer.#drawSurprisedGumbo(gumbo2);
                                    }
                                } else {
                                    renderer.#drawGumboAnimation(gumbo2);
                                }
                                if (animationCounter > 36) {
                                    gumbo3.y += gumbo3Speed;
                                    gumbo3Speed += 3;
                                    if (gumbo3.y >= earthLevelY) {
                                        gumbo3.y = earthLevelY;
                                        gumbo3Speed = 0;
                                        renderer.#drawGumboAnimation(gumbo3);
                                        animationCounter = 0;
                                        gumbo1Speed = -20;
                                        gumbo2Speed = -20;
                                        gumbo3Speed = -20;
                                    } else {
                                        renderer.#drawSurprisedGumbo(gumbo3);
                                    }
                                } else {
                                    renderer.#drawGumboAnimation(gumbo3);
                                }
                            }
                        }, 50);
                    }
                }, 50);
            }
        }, 1000);
    }
    /**
     * Congratulations for Ninjin!!
     * (This method wold be called by GameOverGameState)
     */
    gameOverAnimation() {
        const renderer = this;
        /**
         * @type {Vegetable[]}
         */
        const remainingVegetables = []
        /**
         * @type {number}
         */
        let animationConter = 0;

        this.#vegetables.forEach(v => {
            if (!v.isRevealed) {
                remainingVegetables.push(v);
            }
        })

        this.#ctx.strokeStyle = "#333333";
        this.#ctx.lineWidth = 7;
        this.#ctx.lineCap = "round";

        const semiTimerId = setInterval(function () {
            //First wait until the guessing animation is ended.
            if (!renderer.#timerId) {
                clearInterval(semiTimerId);

                // Then the ANIMATION!!
                renderer.#timerId = setInterval(function() {
                    renderer.resetCanvas();
                    renderer.#drawVegetables();

                    for (let i = 0; i < 5; i++) {
                        const info = renderer.#routeInfos[i];
                        if (info instanceof RouteLineInformation) {
                            renderer.#ctx.beginPath();
                            renderer.#ctx.moveTo(info.lineStartX, info.lineStartY);
                            renderer.#ctx.lineTo(info.lineEndX, info.lineEndY);
                            renderer.#ctx.stroke();
                        }
                    }

                    renderer.#ctx.drawImage(HangNinjinImageInformation.ninjinAnimationImages[animationConter], 139, 78);
                    animationConter++;

                    if(animationConter >= HangNinjinImageInformation.ninjinAnimationImages.length) {
                        renderer.#setAnswerFont();
                        renderer.#ctx.fillStyle = "#ff3333";
                        remainingVegetables.forEach(v => {
                            renderer.#ctx.fillText(v.alphabet, v.x, v.y);
                        });
                        clearInterval(renderer.#timerId);
                    }
                }, 334);
            }
        }, 1000);
    }
    #drawVegetables() {
        this.#vegetables.forEach(v => {
            if (v.isRevealed) {
                this.#setAnswerFont();
                this.#ctx.fillText(v.alphabet, v.x, v.y);
            } else {
                this.#ctx.drawImage(Vegetable.image, v.x, v.y, v.size, v.size);
            }
        });
    }
}

class Vegetable {
    /**
     * @type {HTMLElement}
     */
    static image = document.getElementById("vegetable");
    /**
     * @type {string}
     */
    alphabet;
    /**
     * @type {number}
     */
    x;
    /**
     * @type {number}
     */
    y;
    /**
     * @type {number}
     */
    size;
    /**
     * @type {boolean}
     */
    isRevealed = false;
    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {alphabet} alphabet 
     * @param {number} size
     */
    constructor(x, y, alphabet, size) {
        this.x = x;
        this.y = y;
        this.alphabet = alphabet;

        if (size >= 50) {
            this.size = 50;
        } else {
            this.size = size;
        }
    }
    /**
     * Revealed Vegetable give the alphabet and disappear in the animation. 
     */
    reveal() {
        this.isRevealed = true;
    }
}

class Gumbo {
    /**
     * @type {HTMLElement[]}
     */
    static animations = [document.getElementById("gumboFront1"), document.getElementById("gumboFront2")];
    /**
     * @type {HTMLElement}
     */
    static supriseImage = document.getElementById("gumboSurprise");
    /**
     * @type {number}
     */
    x;
    /**
     * @type {number}
     */
    y;
    /**
     * @type {boolean[]}
     */
    gumboCheckHistory;
    /**
     * @type {string}
     */
    alphabet;
    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {string} alphabet 
     * @param {boolean[]} gumboCheckHistory 
     */
    constructor(x, y, alphabet, gumboCheckHistory) {
        this.x = x;
        this.y = y;
        this.alphabet = alphabet;
        this.gumboCheckHistory = gumboCheckHistory;
    }
}

class HangingGumbo {
    /**
     * @type {HTMLElement[]}
     */
    static animations = [document.getElementById("gumboBigFront1"), document.getElementById("gumboBigFront2")];
    /**
     * @type {number}
     */
    x;
    /**
     * @type {number}
     */
    y;
    /**
     * @type {number}
     */
    speed;
    /**
     * @type {(RouteLineInformation|HangNinjinImageInformation)}
     */
    info;
    /**
     * 
     * @param {(RouteLineInformation|HangNinjinImageInformation)} info 
     */
    constructor(info) {
        this.info = info;
        if (info instanceof RouteLineInformation) {
            if (info.isHorizontal) {
                this.y = info.lineStartY;
                if (info.lineEndX > info.lineStartX) {
                    this.speed = 10;
                    this.x = -60;
                } else {
                    this.speed = -10;
                    this.x = 360;
                }
            } else {
                this.x = info.lineStartX;
                if (info.lineEndY > info.lineStartY) {
                    this.speed = 10;
                    this.y = -60;
                } else {
                    this.speed = -10;
                    this.y = 360;
                }
            }
        }
        if (info instanceof HangNinjinImageInformation) {
            this.speed = 10;
            this.x = 190;
            this.y = -60;
        }
    }
}

class RouteLineInformation {
    /**
     * @type {number}
     */
    lineStartX;
    /**
     * @type {number}
     */
    lineStartY;
    /**
     * @type {number}
     */
    lineEndX;
    /**
     * @type {number}
     */
    lineEndY;
    /**
     * @type {boolean}
     */
    isHorizontal;
    /**
     * 
     * @param {number} lineStartX 
     * @param {number} lineStartY 
     * @param {number} lineEndX 
     * @param {number} lineEndY 
     */
    constructor(lineStartX, lineStartY, lineEndX, lineEndY) {
        this.lineStartX = lineStartX;
        this.lineStartY = lineStartY;
        this.lineEndX = lineEndX;
        this.lineEndY = lineEndY;
        this.isHorizontal = lineStartX != lineEndX;
    }
}
class HangNinjinImageInformation {
    /**
     * @type {HTMLElement[]}
     */
    static gradualImages = [
        document.getElementById("leaves1"),
        document.getElementById("leaves2"),
        document.getElementById("leaves3"),
        document.getElementById("carrotHang1"),
        document.getElementById("carrotHang2"),
        document.getElementById("carrotHang3"),
        document.getElementById("carrotHangSurprise"),
    ];
    static ninjinAnimationImages = [
        document.getElementById("carrotHang4"),
        document.getElementById("carrotHang3"),
        document.getElementById("carrotHang3"),
        document.getElementById("carrotHang4"),
        document.getElementById("carrotHang3"),
        document.getElementById("carrotHang3"),
        document.getElementById("carrotHang4"),
        document.getElementById("carrotHang3"),
        document.getElementById("carrotHang3"),
        document.getElementById("carrotHangSurprise")
    ];
    /**
     * @type {number}
     */
    id;
    /**
     * 
     * @param {number} id 
     */
    constructor(id) {
        this.id = id;
    }
}

class GameState {
    /**
     * When ALPHABET key is pressed, this method does something or not depending on the type of GameState.
     * Return true if you want to change the ALPHABET key's color by InputController, otherwise false.
     * @param {string} alphabet
     * @returns {boolean}
     */
    handleInputAlphabet(alphabet) {
        return false;
    }
    /**
     * When DELETE key is pressed, this method does something or not depending on the type of GameState.
     * Return true if you want to change the DELETE key's color by InputController, otherwise false.
     * @returns {boolean} 
     */
    handleInputDelete() {
        return false;
    }
    /**
     * When ENTER key is pressed, this method does something or not depending on the type of GameState.
     * Return true if you want to change the ENTER key's color by InputController, otherwise false.
     * @returns {boolean}
     */
    handleInputEnter() {
        return false;
    }
}

class PressAnyKeyGameState extends GameState {
    constructor() {
        super();
        canvasRenderer.startPressAnyKeyAnimation();
    }
    /**
     * 
     * @param {string} alphabet 
     */
    handleInputAlphabet(alphabet) {
        this.#startGame();
    }
    handleInputEnter() {
        this.#startGame();
    }
    handleInputDelete() {
        this.#startGame();
    }
    /**
     * Let's start the Game!
     */
    #startGame() {
        canvasRenderer.stopPressAnyKeyAnimation();
        gameState = new InputGameState();
    }
}

class InputGameState extends GameState {
    constructor() {
        super();
        canvasRenderer.resetCanvas();
    }
    /**
     * 
     * @param {string} alphabet 
     */
    handleInputAlphabet(alphabet) {
        if (answer.length + 1 >= maxAnswerLength) {
            return false;
        }
        answer = answer + alphabet;
        canvasRenderer.renderAnswerInput();
        return true;
    }
    handleInputDelete() {
        if (answer.length == 0) {
            return false;
        }
        answer = answer.slice(0, -1);
        canvasRenderer.renderAnswerInput();
        return true;
    }
    handleInputEnter() {
        if (answer.length > 0) {
            gameState = new ConfirmGameState();
            return true;
        }
        return false;
    }
}

class ConfirmGameState extends GameState {
    constructor() {
        super();
        canvasRenderer.renderConfirmInput();
    }
    handleInputDelete() {
        answer = "";
        gameState = new InputGameState();
        return true;
    }
    handleInputEnter() {
        gameState = new GuessingGameState();
        return true;
    }
}

class GuessingGameState extends GameState {
    constructor() {
        super();
        canvasRenderer.startGuessing();
    }
    /**
     * 
     * @param {string} alphabet 
     */
    handleInputAlphabet(alphabet) {
        if (isMistakingNow) {
            return false;
        }
        if (revealedLetters.includes(alphabet)) {
            return false;
        }
        if (mistakeLetters.includes(alphabet)) {
            return false;
        }
        if (answer.includes(alphabet)) {
            revealedLetters.push(alphabet);
            canvasRenderer.revealLetterAnimation(alphabet);

            // check if all the letters of the answer were revealed,
            let checker = true;
            for (let i = 0; i < answer.length; i++) {
                checker = checker & revealedLetters.some(e => e === answer[i]);
            }
            if (checker) {
                gameState = new CongratulationsGameState();
            }

            const key = document.getElementById(alphabet);
            key.style.backgroundColor = "#ffc46c";
            return false;
        } else {
            isMistakingNow = true;
            mistakeLetters.push(alphabet);
            canvasRenderer.drawHangNinjinAnimation();
            
            if (mistakeLetters.length >= 10) {
                gameState = new GameOverGameState();
            }

            const key = document.getElementById(alphabet);
            key.style.backgroundColor = "#000000";
            key.style.color = "#ffffff";
            return false;
        }
    }
}

class CongratulationsGameState extends GameState {
    constructor() {
        super();
        canvasRenderer.gameClearAnimation();
    }
}

class GameOverGameState extends GameState {
    constructor() {
        super();
        canvasRenderer.gameOverAnimation();
    }
}