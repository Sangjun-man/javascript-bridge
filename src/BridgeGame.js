const BridgeMaker = require("./BridgeMaker");
const BridgeRandomNumberGenerator = require("./BridgeRandomNumberGenerator");
const MovementStatus = require("./model/MovementStatus");
const GameStatus = require("./model/GameStatus");
const ValidationCheck = require("./VaildationCheck");

/**
 * 다리 건너기 게임을 관리하는 클래스
 */
class BridgeGame {
  #bridge;
  #movementStatus;
  #gameStatus;

  constructor(size) {
    ValidationCheck.isNumberIntheRange([3, 20], size);
    this.#bridge = BridgeMaker.makeBridge(
      size,
      BridgeRandomNumberGenerator.generate
    );
    this.#movementStatus = new MovementStatus();
    this.#gameStatus = new GameStatus();
  }

  /**
   * 사용자가 칸을 이동할 때 사용하는 메서드
   * <p>
   * 이동을 위해 필요한 메서드의 반환 값(return value), 인자(parameter)는 자유롭게 추가하거나 변경할 수 있다.
   */
  move(moveInput) {
    const movementStatus = this.movementStatus;
    const gameStatus = this.gameStatus;
    const { upperResult, lowerResult, roundCheckResult } = this.roundCheck(
      moveInput,
      movementStatus.round
    );
    const success = movementStatus.round === this.#bridge.length - 1;
    this.#movementStatusUpdate({ upperResult, lowerResult });
    this.#gameStatusUpdate({ playing: roundCheckResult, success });
    return { movementStatus, gameStatus };
  }

  /**
   * 사용자가 게임을 다시 시도할 때 사용하는 메서드
   * <p>
   * 재시작을 위해 필요한 메서드의 반환 값(return value), 인자(parameter)는 자유롭게 추가하거나 변경할 수 있다.
   */
  retry(retryInput) {
    ValidationCheck.isStringIntheList(["Q", "R"], retryInput);
    const { trial } = this.gameStatus;
    if (retryInput === "R") {
      this.#moventStatusReset();
      this.#gameStatusUpdate({ playing: false, trial: trial + 1 });
      return true;
    }
    return false;
  }

  roundCheck(moveInput, round) {
    const bridge = [...this.#bridge];
    const upperResult = moveInput === "U" ? moveInput === bridge[round] : null;
    const lowerResult = moveInput === "D" ? moveInput === bridge[round] : null;
    const roundCheckResult =
      moveInput === bridge[round] && round < bridge.length - 1;
    return { upperResult, lowerResult, roundCheckResult };
  }
  #movementStatusUpdate(movementResult) {
    const { upperResult, lowerResult } = movementResult;
    this.#movementStatus.upperSideStatus.push(upperResult);
    this.#movementStatus.lowerSideStatus.push(lowerResult);
    this.#movementStatus.round++;
  }
  #moventStatusReset() {
    this.#movementStatus = new MovementStatus();
  }
  #gameStatusUpdate(gameresult) {
    const { success, playing, trial } = gameresult;
    if (success !== undefined) this.#gameStatus.success = success;
    if (playing !== undefined) this.#gameStatus.playing = playing;
    if (trial !== undefined) this.#gameStatus.trial = trial;
  }
  get movementStatus() {
    return { ...this.#movementStatus };
  }
  get gameStatus() {
    return { ...this.#gameStatus };
  }
}

module.exports = BridgeGame;
