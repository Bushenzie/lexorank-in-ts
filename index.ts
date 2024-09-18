const MAX_CHAR_THRESHOLD = 10;
const CHARSET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const BASE = CHARSET.length;
const MIN_CHAR = CHARSET[0];
const MAX_CHAR = CHARSET[BASE - 1];
const MIN_RANK = MIN_CHAR;
const MAX_RANK = MAX_CHAR.repeat(MAX_CHAR_THRESHOLD);

export interface IRankable {
    rank: string;
}

/**
 * Function to get character from index from 0 to `BASE`
 */
export function getCharFromIndex(index: number) {
    return CHARSET[index];
}

/**
 * Function to get index from character based on CHARSET
 */
export function getIndexFromChar(char: string) {
    return CHARSET.indexOf(char);
}

/**
 * Function to truncated average
 */
export function average(num1: number, num2: number) {
    return Math.trunc((num1 + num2) / 2);
}

/**
 * Function to get rank that comes before an index
 */
export function getRankBefore<T extends IRankable>(items: T[], index: number) {
    const sortedItems = items.sort(sortRanks);
    const item = sortedItems[index - 1];

    if (!item) return null;
    if (item.rank === MIN_RANK || item.rank.length >= MAX_CHAR_THRESHOLD)
        throw new Error("Rebalance is needed");

    return item.rank;
}

/**
 * Function to get rank that comes after an index
 */
export function getRankAfter<T extends IRankable>(items: T[], index: number) {
    const sortedItems = items.sort(sortRanks);
    const item = sortedItems[index + 1];

    if (!item) return null;
    if (item.rank === MAX_RANK || item.rank.length >= MAX_CHAR_THRESHOLD)
        throw new Error("Rebalance is needed");

    return item.rank;
}

/**
 * Function to get first rank based on items
 */
export function getFirstPossibleRankInItems<T extends IRankable>(items: T[]) {
    const sortedItems = items.sort(sortRanks);
    const firstRank = sortedItems[0].rank;
    const midrank = getMidrank(firstRank, MIN_RANK);

    if (!midrank) throw new Error("Rebalance is needed");

    return midrank;
}

/**
 * Function to get last rank based on items
 */
export function getLastPossibleRankInItems<T extends IRankable>(items: T[]) {
    const sortedItems = items.sort(sortRanks);
    let lastRank = sortedItems[sortedItems.length - 1].rank;

    let lastPossibleRank = lastRank;
    if (lastRank.startsWith("Z")) {
        lastPossibleRank += MIN_RANK;
    } else {
        const index = parseInt(lastRank, BASE) + 1;
        lastPossibleRank = index.toString(BASE).toUpperCase();
    }

    if (lastPossibleRank === MAX_RANK || lastRank.length >= MAX_CHAR_THRESHOLD)
        throw new Error("Rebalance is needed");

    return lastPossibleRank;
}

/**
 * Function to sort by ranks
 *
 * Can be used in `.sort()` method and also with plain ranks
 */
export function sortRanks<T extends IRankable>(
    item1: T | string,
    item2: T | string
) {
    const rank1 = typeof item1 === "string" ? item1 : item1.rank;
    const rank2 = typeof item2 === "string" ? item2 : item2.rank;
    return rank1 > rank2 ? 1 : rank1 < rank2 ? -1 : 0;
    // const maxLength = Math.max(rank1.length, rank2.length);

    // for (let i = 0; i < maxLength; i++) {
    //     const indexRank1 = getIndexFromChar(rank1[i] ?? getCharFromIndex(0));
    //     const indexRank2 = getIndexFromChar(rank2[i] ?? getCharFromIndex(0));

    //     if (indexRank1 !== indexRank2)
    //         return indexRank1 - indexRank2 > 0 ? 1 : -1;
    // }

    // return 0;
}

/**
 * Function to get character in the middle of specified characters
 */
export function getMidChar(char1: string, char2: string) {
    if (char1.length > 1 || char2.length > 1) return null;
    let midCharIndex = average(
        getIndexFromChar(char1),
        getIndexFromChar(char2)
    );
    return getCharFromIndex(midCharIndex);
}

/**
 * Function to check if midrank between `rank1` and `rank2`
 */
export function getMidrank(rank1: string, rank2: string) {
    let midrank = "";
    const maxLength = Math.max(rank1.length, rank2.length);

    if (sortRanks(rank1, rank2) === 1) [rank1, rank2] = [rank2, rank1];

    for (let i = 0; i < maxLength; i++) {
        let char1 = rank1[i] ?? MIN_CHAR;
        let char2 = rank2[i] ?? MAX_CHAR;

        let midChar = getMidChar(char1, char2);
        midrank += midChar;
    }

    if (midrank === rank1 || midrank === rank2) {
        let midChar = getMidChar(MIN_CHAR, MAX_CHAR);
        midrank += midChar;
    }
    if (!isValidMidrank(midrank, rank1, rank2)) return null;
    return midrank;
}

/**
 * Function to check if midrank is valid
 */
export function isValidMidrank(midrank: string, rank1: string, rank2: string) {
    if (sortRanks(rank1, rank2) === 1) [rank1, rank2] = [rank2, rank1];
    return rank1 < midrank && midrank < rank2;
}

/**
 * Function to check if rebalance is needed based if ranks are too long or too close to eachother
 */

export function isRebalanceNeeded<T extends IRankable>(items: T[]) {
    let charsTooClose = false;
    let cornersReached = false;
    let maxCharsReached = items.some(
        (item) => item.rank.length >= MAX_CHAR_THRESHOLD
    );

    for (let i = 0; i < items.length - 1; i++) {
        const rank1 = items[i].rank;
        const rank2 = items[i + 1].rank;
        if (
            rank1 === MIN_RANK ||
            rank2 === MIN_RANK ||
            rank1 === MAX_RANK ||
            rank2 === MAX_RANK
        ) {
            cornersReached = true;
            break;
        }
        const midrank = getMidrank(rank1, rank2);
        if (midrank === null) {
            charsTooClose = true;
            break;
        }
    }

    return charsTooClose || maxCharsReached || cornersReached;
}

/**
 * Function to rebalance items
 */
export function rebalance<T extends IRankable>(items: T[]) {
    const sortedItems = items.sort(sortRanks);

    const itemsLength = sortedItems.length;
    const charsPerRank = Math.ceil(itemsLength / BASE / BASE) + 1;
    const maxIndex = Math.pow(BASE, charsPerRank) - 1;
    const stepSize = Math.floor(maxIndex / itemsLength);

    sortedItems.forEach((item, index) => {
        const newRankValue = stepSize * index;
        let newRank = newRankValue
            .toString(BASE)
            .toUpperCase()
            .padStart(charsPerRank, "0");

        item.rank = newRank;
    });

    return sortedItems;
}