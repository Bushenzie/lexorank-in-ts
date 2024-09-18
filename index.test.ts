import {beforeAll, describe,expect,it} from "vitest"
import * as lexorank from "./index"

describe("Lexorank test",() => {
    let items: lexorank.IRankable[];

    beforeAll(() => {
        items = [
            {rank: "A"},
            {rank: "ZZZZZZZZZZ"},
            {rank: "Z0"},
            {rank: "0"},
            {rank: "00"},
            {rank: "HM"},
            {rank: "H"},
        ]
    })
    
    it("GetCharFromIndex tests",() => {
        expect(lexorank.getCharFromIndex(0)).toBe("0")
        expect(lexorank.getCharFromIndex(10)).toBe("A")
        expect(lexorank.getCharFromIndex(35)).toBe("Z")
        expect(lexorank.getCharFromIndex(36)).toBeUndefined()
    })

    it("GetIndexFromChar tests",() => {
        expect(lexorank.getIndexFromChar("0")).toBe(0)
        expect(lexorank.getIndexFromChar("Z")).toBe(35)
        expect(lexorank.getIndexFromChar("Z0")).toBe(-1)
    })

    it("Midrank tests",() => {
        expect(lexorank.getMidChar("A","Z")).toBe("M")
        expect(lexorank.getMidChar("0","Z")).toBe("H")
        expect(lexorank.getMidChar("0","HH")).toBeNull()

        expect(lexorank.isValidMidrank("00","0","01")).toBe(true)
        expect(lexorank.isValidMidrank("00","00","01")).toBe(false)
        expect(lexorank.isValidMidrank("HH1","0","Q")).toBe(true)

        expect(lexorank.getMidrank("A","Z")).toBe("M")
        expect(lexorank.getMidrank("0","ZZ")).toBe("HH")
        expect(lexorank.getMidrank("A","ZZ")).toBe("MH")
        expect(lexorank.getMidrank("00","01")).toBe("00H")
        expect(lexorank.getMidrank("0","00")).toBe(null)
    })

    it("Sorting ranks",() => {
        expect(lexorank.sortRanks("A","ZZ")).toBe(-1)
        expect(lexorank.sortRanks("ZZ","Z")).toBe(1)
        expect(lexorank.sortRanks("A","A")).toBe(0)
        expect(lexorank.sortRanks("A","A0")).toBe(-1)

        expect(items.sort(lexorank.sortRanks)).toStrictEqual([
            {rank: "0"},
            {rank: "00"},
            {rank: "A"},
            {rank: "H"},
            {rank: "HM"},
            {rank: "Z0"},
            {rank: "ZZZZZZZZZZ"},
        ])
    })

    it("Getters for Before,After,First & Last ranks",() => {
        let mockItems = [{rank: "01"},{rank: "Z0"}]

        expect(lexorank.getRankBefore(items,2)).toBe("00")
        expect(lexorank.getRankBefore(items,0)).toBe(null)
        expect(() => lexorank.getRankBefore(items,1)).toThrow("Rebalance is needed")

        expect(lexorank.getRankAfter(items,2)).toBe("H")
        expect(lexorank.getRankAfter(items,6)).toBe(null)
        expect(() => lexorank.getRankAfter(items,5)).toThrow("Rebalance is needed")

        expect(() => lexorank.getFirstPossibleRankInItems(items)).toThrow("Rebalance is needed")
        expect(lexorank.getFirstPossibleRankInItems(mockItems)).toBe("00")

        expect(lexorank.getLastPossibleRankInItems(mockItems)).toBe("Z00")

        mockItems = [{rank:"Y0"}]
        expect(lexorank.getLastPossibleRankInItems(mockItems)).toBe("Y1")

        mockItems = [{rank: "ZZZZZZZZZZ"}]
        expect(() => lexorank.getLastPossibleRankInItems(items)).toThrow("Rebalance is needed")
    })

    it("Rebalances",() => {
        let mockItems = [{rank: "A"},{rank: "Z"}]
        expect(lexorank.isRebalanceNeeded(items)).toBe(true)
        expect(lexorank.isRebalanceNeeded(mockItems)).toBe(false)

        mockItems = [{rank: "0"},{rank: "01"}]
        expect(lexorank.isRebalanceNeeded(mockItems)).toBe(true)

        expect(lexorank.rebalance(items)).toStrictEqual([
            {rank: "00"},
            {rank: "55"},
            {rank: "AA"},
            {rank: "FF"},
            {rank: "KK"},
            {rank: "PP"},
            {rank: "UU"}
        ])
    })
})