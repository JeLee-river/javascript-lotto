var __typeError = (msg) => {
  throw TypeError(msg);
};
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var _isFrozen;
(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
const headerContents = '<header>\n  <a href="/javascript-lotto">\n    <h1>🎱 행운의 로또</h1>\n  </a>\n</header>\n';
const appendContents = (parentSelector, childSelector, contents) => {
  const parentElement = document.querySelector(parentSelector);
  const childElement = parentElement.querySelector(childSelector);
  if (childElement) {
    parentElement.replaceChildren();
  }
  parentElement.insertAdjacentHTML("beforeend", contents);
};
const prependContents = (parentSelector, childSelector, contents) => {
  const parentElement = document.querySelector(parentSelector);
  const childElement = parentElement.querySelector(childSelector);
  if (childElement) {
    parentElement.replaceChildren();
  }
  parentElement.insertAdjacentHTML("afterbegin", contents);
};
const insertTextContents = (targetSelector, contents) => {
  const targetElement = document.querySelector(targetSelector);
  targetElement.textContent = contents;
};
const createHeader = () => {
  prependContents("#app", "header", headerContents);
};
const gameBoxContents = '<section class="game-container">\n  <h2>🎱 내 번호 당첨 확인 🎱</h2>\n  <form class="purchase-form">\n    <label for="price">구입할 금액을 입력해주세요.</label>\n    <div class="purchase-container" data-type="dynamic">\n      <button type="submit" class="purchase-button">구입</button>\n    </div>\n  </form>\n  <div class="lotto-container">\n    <p class="purchase-message" data-type="dynamic"></p>\n    <ul class="lotto-list" data-type="dynamic"></ul>\n  </div>\n</section>\n';
class FrozenMap extends Map {
  constructor(entries) {
    super();
    __privateAdd(this, _isFrozen);
    __privateSet(this, _isFrozen, false);
    if (!entries) {
      return;
    }
    for (const [key, value] of entries) {
      super.set(key, value);
    }
    __privateSet(this, _isFrozen, true);
  }
  freeze() {
    __privateSet(this, _isFrozen, true);
  }
  getIsFrozen() {
    return __privateGet(this, _isFrozen);
  }
  set(key, value) {
    if (__privateGet(this, _isFrozen)) {
      throw new Error("Freeze 상태에서는 set 메서드를 사용할 수 없습니다.");
    }
    super.set(key, value);
  }
  delete() {
    throw new Error("Frozen Map객체는 delete 메서드를 사용할 수 없습니다.");
  }
  clear() {
    throw new Error("Frozen Map객체는 clear 메서드를 사용할 수 없습니다.");
  }
}
_isFrozen = new WeakMap();
const LOTTO_RULE = Object.freeze({
  MULTIPLE_PRICE: 1e3,
  MIN_PRICE: 1e3,
  MAX_PRICE: 1e5,
  MIN_LOTTO_NUMBER: 1,
  MAX_LOTTO_NUMBER: 45,
  LOTTO_LENGTH: 6
});
const LOTTO_MATCHED_NUMBER_COUNT = new FrozenMap([
  [3, "3개 일치"],
  [4, "4개 일치"],
  [5, "5개 일치"],
  ["5B", "5개 일치+보너스"],
  [6, "6개 일치"]
]);
const LOTTO_PRIZE_MONEY = new FrozenMap([
  ["3개 일치", 5e3],
  ["4개 일치", 5e4],
  ["5개 일치", 15e5],
  ["5개 일치+보너스", 3e7],
  ["6개 일치", 2e9]
]);
Array.from(LOTTO_MATCHED_NUMBER_COUNT).reduce(
  (messages, [matchedCount, matchKey]) => {
    const prizeMoney = LOTTO_PRIZE_MONEY.get(matchKey).toLocaleString();
    if (matchKey === "5개 일치+보너스") {
      messages.set(matchedCount, `5개 일치, 보너스 볼 일치 (${prizeMoney}원) - `);
      return messages;
    }
    messages.set(matchedCount, `${matchedCount}개 일치 (${prizeMoney}원) - `);
    return messages;
  },
  new FrozenMap()
);
const LOTTO_RESTART_COMMAND = Object.freeze({
  restart: "y",
  end: "n"
});
const createPriceInput = () => {
  return `<input
      type="number"
      id="price"
      placeholder="금액"
      onfocus="this.placeholder = ''"
      onblur="this.placeholder = '금액'"
      min="${LOTTO_RULE.MIN_PRICE}"
      max="${LOTTO_RULE.MAX_PRICE}"
      autocomplete="off"
    />`;
};
const createGameBox = () => {
  appendContents("main", ".game-container", gameBoxContents);
  const priceInput = createPriceInput();
  prependContents(".purchase-container", "#price", priceInput);
};
const winningLottoBoxContents = '<div class="winning-lotto-container invisible">\n  <p>지난 주 당첨번호 6개와 보너스 번호 1개를 입력해주세요.</p>\n  <form class="winning-lotto-form">\n    <div class="numbers-container">\n      <div class="winning-numbers-container">\n        <label for="winning-numbers">당첨 번호</label>\n        <div class="numbers-input-container" data-type="dynamic"></div>\n      </div>\n      <div class="bonus-number-container">\n        <label for="bonus-number" data-type="dynamic">보너스 번호</label>\n      </div>\n    </div>\n    <button type="submit" class="result-button">결과 확인하기</button>\n  </form>\n</div>\n';
const setNumberInput = (className, minNumber, maxNumber) => {
  return `<input
          type="number"
          class="${className}"
          min="${minNumber}"
          max="${maxNumber}"
          autocomplete="off"
        />`;
};
const createNumbersInput = () => {
  return Array.from({ length: LOTTO_RULE.LOTTO_LENGTH }).map(() => {
    return setNumberInput(
      "winning-numbers",
      LOTTO_RULE.MIN_LOTTO_NUMBER,
      LOTTO_RULE.MAX_LOTTO_NUMBER
    );
  }).join("");
};
const createBonusNumberInput = () => {
  return setNumberInput(
    "bonus-number",
    LOTTO_RULE.MIN_LOTTO_NUMBER,
    LOTTO_RULE.MAX_LOTTO_NUMBER
  );
};
const createWinningLottoBox = () => {
  appendContents(
    ".game-container",
    ".winning-lotto-container",
    winningLottoBoxContents
  );
  const numbersInput = createNumbersInput();
  const bonusNumberInput = createBonusNumberInput();
  appendContents(".numbers-input-container", ".winning-numbers", numbersInput);
  appendContents(".bonus-number-container", ".bonus-number", bonusNumberInput);
};
const footerContents = '<footer><div class="copyright">Copyright 2025. woowacourse</div></footer>\n';
const createFooter = () => {
  appendContents("#app", "footer", footerContents);
};
const createLotto = (numbers) => {
  const lottoLiteral = `
        <li class="lotto-numbers">
          <span class="lotto-icon">🎟️</span>
          <p class="lotto-number">${numbers.join(", ")}</p>
        </li>
      `;
  return lottoLiteral;
};
const createLottoList = (lottoNumbers) => {
  const lottoList = `${lottoNumbers.map((numbers) => createLotto(numbers)).join("")}`;
  return lottoList;
};
const PROMPT_MESSAGE = Object.freeze({
  PURCHASE_PRICE: "구입금액을 입력해 주세요.",
  PURCHASE_QUANTITY: "개를 구매했습니다.",
  WINNING_NUMBER_INPUT: "당첨 번호를 입력해 주세요.",
  BONUS_NUMBER_INPUT: "보너스 번호를 입력해 주세요.",
  LOTTO_RESULT: "당첨 통계\n--------------------",
  RESTART_INPUT: `다시 시작하시겠습니까? (${LOTTO_RESTART_COMMAND.restart}/${LOTTO_RESTART_COMMAND.end})`
});
const ERROR_MESSAGE = Object.freeze({
  INVALID_INTEGER: "정수만 입력 가능합니다.",
  INVALID_MULTIPLE_OF_THOUSAND: `${LOTTO_RULE.MULTIPLE_PRICE}원 단위로 입력해 주세요.`,
  INVALID_MIN_PRICE: `최소 구입 금액은 ${LOTTO_RULE.MIN_PRICE}원입니다.`,
  INVALID_OVER_MAX_PRICE: `최대 구입 금액은 ${LOTTO_RULE.MAX_PRICE}원입니다.`,
  INVALID_LOTTO_NUMBER_RANGE: `${LOTTO_RULE.MIN_LOTTO_NUMBER}부터 ${LOTTO_RULE.MAX_LOTTO_NUMBER}까지의 숫자를 입력해 주세요.`,
  INVALID_DUPLICATE_NUMBER: "중복된 숫자는 입력할 수 없습니다.",
  INVALID_LOTTO_LENGTH: `${LOTTO_RULE.LOTTO_LENGTH}개의 숫자를 입력해 주세요.`,
  INVALID_DUPLICATE_BONUS_NUMBER: "보너스 번호는 당첨 번호와 중복될 수 없습니다.",
  INVALID_RESTART: `${LOTTO_RESTART_COMMAND.restart} 또는 ${LOTTO_RESTART_COMMAND.end}을 입력해 주세요.`
});
const ERROR_PREFIX = Object.freeze({
  typeError: "[Type Error]",
  invalidInputError: "[Invalid Input Error]",
  rangeError: "[Range Error]",
  duplicateError: "[Duplicate Error]",
  lengthError: "[Length Error]"
});
const createPurchaseMessage = (lottoNumbers) => {
  const purchaseMessage = `${lottoNumbers.length}${PROMPT_MESSAGE.PURCHASE_QUANTITY}`;
  return purchaseMessage;
};
const createLottoBox = (lottoNumbers) => {
  const purchaseMessage = createPurchaseMessage(lottoNumbers);
  const lottoList = createLottoList(lottoNumbers);
  insertTextContents(".purchase-message", purchaseMessage);
  appendContents(".lotto-list", ".lotto-numbers", lottoList);
};
const getPrice = () => {
  return Number(document.querySelector("#price").value);
};
const getLottoNumbers = () => {
  return [...document.querySelectorAll(".lotto-number")].map(
    (p) => p.textContent.split(",").map(Number)
  );
};
const getWinningNumbers = () => {
  return [...document.querySelectorAll(".winning-numbers")].map(
    (number) => Number(number.value)
  );
};
const getBonusNumber = () => {
  return Number(document.querySelector(".bonus-number").value);
};
const readLottoPrice = (validator, renderer) => {
  const purchaseForm = document.querySelector(".purchase-form");
  const purchaseContainer = document.querySelector(".purchase-container");
  purchaseForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const price = getPrice();
    const isValidPrice = validator(price);
    if (isValidPrice) {
      purchaseContainer.querySelectorAll("input, button").forEach((element) => {
        element.disabled = true;
      });
      renderer(price);
    }
  });
};
const readWinningNumbers = (validator, renderer) => {
  const winningLottoForm = document.querySelector(".winning-lotto-form");
  const numbersContainer = document.querySelector(".numbers-container");
  winningLottoForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const winningNumbers = getWinningNumbers();
    const bonusNumber = getBonusNumber();
    const isValidNumbers = validator(winningNumbers, bonusNumber);
    if (isValidNumbers) {
      numbersContainer.querySelectorAll("input").forEach((element) => {
        element.disabled = true;
      });
      renderer(winningNumbers, bonusNumber);
    }
  });
};
const revealElement = (targetSelector) => {
  const target = document.querySelector(targetSelector);
  target.classList.replace("invisible", "visible");
};
const showModal = (modalSelector) => {
  const targetModal = document.querySelector(modalSelector);
  targetModal.showModal();
};
const closeModal = (targetSelector) => {
  const targetModal = document.querySelector(targetSelector);
  targetModal.addEventListener("click", (event) => {
    if (event.target.closest(".close-button") || event.target.nodeName === "DIALOG") {
      targetModal.close();
    }
  });
};
const restartGame = () => {
  const restartButton = document.querySelector(".restart-button");
  restartButton.addEventListener("click", () => {
    location.replace(location.href);
  });
};
const errorAlertContents = '<div class="alert-container">\n  <p class="error-message" data-type="dynamic"></p>\n  <button class="close-button close-alert">확인</button>\n</div>\n\n';
const createErrorAlertModal = (message) => {
  appendContents(".error-alert-modal", ".alert-container", errorAlertContents);
  insertTextContents(".error-message", message);
};
const prizeResultContents = '<div class="result-container">\n  <button class="close-button">\n    <img src="close-icon.png" alt="close-icon" />\n  </button>\n  <h2>🏆 당첨 통계 🏆</h2>\n  <table>\n    <thead class="prize-table-header" data-type="dynamic"></thead>\n    <tbody class="prize-table-body" data-type="dynamic"></tbody>\n  </table>\n  <h3 class="revenue-rate-message" data-type="dynamic"></h3>\n  <button class="restart-button">다시 시작하기</button>\n</div>\n';
const PRIZE_RESULT = {
  HEADERS: ["일치갯수", "당첨금", "당첨갯수"],
  LOTTO_UNIT: "개",
  REVENUE_RATE_DIGITS: 2
};
const LOTTO_RESULT_TABLE_MAP = Array.from(
  LOTTO_MATCHED_NUMBER_COUNT
).reduce((matchedTemplate, [matchedCount, matchKey]) => {
  if (matchKey === "5개 일치+보너스") {
    matchedTemplate.set(matchedCount, "5개+보너스볼");
    return matchedTemplate;
  }
  matchedTemplate.set(matchedCount, `${matchedCount}개`);
  return matchedTemplate;
}, new FrozenMap());
const setHeader = (headers) => {
  return `
    <tr>
    ${headers.map((header) => {
    return `<th>${header}</th>`;
  }).join("")}
    </tr>
  `;
};
const setRow = (row) => {
  return `
    <tr>
      ${row.map((element) => {
    return `<td>${element}</td>`;
  }).join("")}
    </tr>
  `;
};
const createPrizeTable = (result) => {
  const rows = Array.from(result).map(([matchedCount, matchedLottos]) => {
    const prizeKey = LOTTO_MATCHED_NUMBER_COUNT.get(matchedCount);
    const matchedTemplate = LOTTO_RESULT_TABLE_MAP.get(matchedCount);
    const prize = LOTTO_PRIZE_MONEY.get(prizeKey).toLocaleString();
    return [
      matchedTemplate,
      prize,
      `${matchedLottos}${PRIZE_RESULT.LOTTO_UNIT}`
    ];
  });
  const headerTemplate = setHeader([...PRIZE_RESULT.HEADERS]);
  const rowTemplate = rows.map((row) => setRow(row)).join("");
  return { headerTemplate, rowTemplate };
};
const getRevenueRate = (revenue, cost) => {
  return revenue / cost * 100;
};
const roundNumber = (number, roundDigits) => {
  const fixedNumber = Number(number.toFixed(roundDigits));
  return fixedNumber;
};
const createRevenueRateMessage = (revenueRate) => {
  const formattedRevenueRate = roundNumber(
    revenueRate,
    PRIZE_RESULT.REVENUE_RATE_DIGITS
  );
  return `당신의 총 수익률은 ${formattedRevenueRate}% 입니다.`;
};
const createPrizeResultModal = (result, revenueRate) => {
  const { headerTemplate, rowTemplate } = createPrizeTable(result);
  const revenueRateMessage = createRevenueRateMessage(revenueRate);
  appendContents(
    ".prize-result-modal",
    ".result-container",
    prizeResultContents
  );
  appendContents(".prize-table-header", "th", headerTemplate);
  appendContents(".prize-table-body", "td", rowTemplate);
  insertTextContents(".revenue-rate-message", revenueRateMessage);
};
const validateInput = ({ validatorList, errorHandler }) => {
  try {
    validatorList.forEach((validator) => validator());
    return true;
  } catch (error) {
    errorHandler(error);
    return false;
  }
};
class CustomError extends Error {
  constructor(message, prefix) {
    super(`${prefix} ${message}`);
  }
}
const isMultipleOf = (number, multiple) => {
  return number % multiple === 0;
};
const isInRange = (number, min = -Infinity, max = Infinity) => {
  return number >= min && number <= max;
};
const isDuplicate = (array) => {
  return new Set(array).size !== array.length;
};
const hasNotInteger = (array) => {
  return array.some((number) => !Number.isSafeInteger(number));
};
const validateLottoPrice = (price) => {
  if (!Number.isSafeInteger(price)) {
    throw new CustomError(ERROR_MESSAGE.INVALID_INTEGER, ERROR_PREFIX.typeError);
  }
  if (!isInRange(price, LOTTO_RULE.MIN_PRICE)) {
    throw new CustomError(ERROR_MESSAGE.INVALID_MIN_PRICE, ERROR_PREFIX.rangeError);
  }
  if (!isMultipleOf(price, LOTTO_RULE.MULTIPLE_PRICE)) {
    throw new CustomError(ERROR_MESSAGE.INVALID_MULTIPLE_OF_THOUSAND, ERROR_PREFIX.invalidInputError);
  }
  if (!isInRange(price, null, LOTTO_RULE.MAX_PRICE)) {
    throw new CustomError(ERROR_MESSAGE.INVALID_OVER_MAX_PRICE, ERROR_PREFIX.rangeError);
  }
};
const generateLottoNumbers = () => {
  const numbers = Array.from(
    { length: LOTTO_RULE.MAX_LOTTO_NUMBER },
    (_, i) => i + 1
  );
  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }
  const lottoNumbers = numbers.slice(0, LOTTO_RULE.LOTTO_LENGTH);
  return lottoNumbers.sort((a, b) => a - b);
};
const generateLottoNumberSets = (price) => {
  const purchaseQuantity = price / LOTTO_RULE.MULTIPLE_PRICE;
  return Array.from({ length: purchaseQuantity }, () => generateLottoNumbers());
};
const validateWinningNumbers = (winningNumbers) => {
  if (winningNumbers.length !== LOTTO_RULE.LOTTO_LENGTH) {
    throw new CustomError(ERROR_MESSAGE.INVALID_LOTTO_LENGTH, ERROR_PREFIX.lengthError);
  }
  if (hasNotInteger(winningNumbers)) {
    throw new CustomError(ERROR_MESSAGE.INVALID_INTEGER, ERROR_PREFIX.typeError);
  }
  const isInvalidLottoNumberRange = winningNumbers.some(
    (number) => !isInRange(
      number,
      LOTTO_RULE.MIN_LOTTO_NUMBER,
      LOTTO_RULE.MAX_LOTTO_NUMBER
    )
  );
  if (isInvalidLottoNumberRange) {
    throw new CustomError(ERROR_MESSAGE.INVALID_LOTTO_NUMBER_RANGE, ERROR_PREFIX.rangeError);
  }
  if (isDuplicate(winningNumbers)) {
    throw new CustomError(ERROR_MESSAGE.INVALID_DUPLICATE_NUMBER, ERROR_PREFIX.duplicateError);
  }
};
const validateBonusNumber = (bonusNumber, winningNumbers) => {
  if (!Number.isSafeInteger(bonusNumber)) {
    throw new CustomError(ERROR_MESSAGE.INVALID_INTEGER, ERROR_PREFIX.typeError);
  }
  if (!isInRange(
    bonusNumber,
    LOTTO_RULE.MIN_LOTTO_NUMBER,
    LOTTO_RULE.MAX_LOTTO_NUMBER
  )) {
    throw new CustomError(ERROR_MESSAGE.INVALID_LOTTO_NUMBER_RANGE, ERROR_PREFIX.rangeError);
  }
  if (isDuplicate([bonusNumber, ...winningNumbers])) {
    throw new CustomError(ERROR_MESSAGE.INVALID_DUPLICATE_BONUS_NUMBER, ERROR_PREFIX.duplicateError);
  }
};
const getIntersection = (array1, array2) => {
  const arraySet = new Set(array2);
  return array1.filter((value) => arraySet.has(value));
};
const calculatePrizeResult = (lottoNumbers, winningNumbers, bonusNumber) => {
  const initResult = Array.from(LOTTO_MATCHED_NUMBER_COUNT).map(([key]) => [key, 0]);
  const result = new Map(initResult);
  lottoNumbers.forEach((numbers) => {
    const count = getIntersection(numbers, winningNumbers).length;
    if (!LOTTO_PRIZE_MONEY.has(LOTTO_MATCHED_NUMBER_COUNT.get(count))) {
      return;
    }
    if (count === 5 && numbers.includes(bonusNumber)) {
      const prevCount2 = result.get("5B") ?? 0;
      result.set("5B", prevCount2 + 1);
      return;
    }
    const prevCount = result.get(count) ?? 0;
    result.set(count, prevCount + 1);
  });
  return result;
};
const getTotalPrizeMoney = (result) => {
  return Array.from(result).reduce((acc, [matchKey, count]) => {
    const matchedCount = LOTTO_MATCHED_NUMBER_COUNT.get(matchKey);
    return acc + count * LOTTO_PRIZE_MONEY.get(matchedCount);
  }, 0);
};
const startGame = () => {
  initLayer();
  handleUserInput();
};
const initLayer = () => {
  createHeader();
  createFooter();
  createGameBox();
  createWinningLottoBox();
};
const handleUserInput = () => {
  readLottoPrice(checkPrice, rendererUsingPrice);
  readWinningNumbers(checkWinningLotto, rendererUsingWinningLotto);
};
const checkPrice = (price) => {
  return validateInput({
    validatorList: [() => validateLottoPrice(price)],
    errorHandler: (error) => {
      createErrorAlertModal(error.message);
      handleErrorAlert(".error-alert-modal");
    }
  });
};
const rendererUsingPrice = (price) => {
  const lottoNumbers = generateLottoNumberSets(price);
  createLottoBox(lottoNumbers);
  revealElement(".winning-lotto-container");
};
const checkWinningLotto = (winningNumbers, bonusNumber) => {
  return validateInput({
    validatorList: [
      () => validateWinningNumbers(winningNumbers),
      () => validateBonusNumber(bonusNumber, winningNumbers)
    ],
    errorHandler: (error) => {
      createErrorAlertModal(error.message);
      handleErrorAlert(".error-alert-modal");
    }
  });
};
const rendererUsingWinningLotto = (winningNumbers, bonusNumber) => {
  const price = getPrice();
  const lottoNumbers = getLottoNumbers();
  const result = calculatePrizeResult(
    lottoNumbers,
    winningNumbers,
    bonusNumber
  );
  const totalPrizeMoney = getTotalPrizeMoney(result);
  const revenueRate = getRevenueRate(totalPrizeMoney, price);
  createPrizeResultModal(result, revenueRate);
  handleResultModal(".prize-result-modal");
};
const handleResultModal = (targetSelector) => {
  showModal(targetSelector);
  closeModal(targetSelector);
  restartGame();
};
const handleErrorAlert = (targetSelector) => {
  showModal(targetSelector);
  closeModal(targetSelector);
};
startGame();
