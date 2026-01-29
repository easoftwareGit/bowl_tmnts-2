import { exportedForTesting, sanitizeGame, validateGame, validateGames, validGameFkId } from "@/lib/validation/games/validate"
import { initGame } from "@/lib/db/initVals";
import { gameType, validGamesType } from "@/lib/types/types";
import { ErrorCode, maxGames, maxScore } from "@/lib/validation/validation";
import { mockGamesToPost } from "../../mocks/tmnts/singlesAndDoubles/mockSquads";

const { gotGameData, validGameNumber, validScore, validGameData } = exportedForTesting;

const validGame = {
  ...initGame,
  id: 'gam_213c32ca2880492fb0170d2022a0b854',
  squad_id: 'sqd_7116ce5f80164830830a7157eb093396',
  player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
  game_num: 1,
  score: 201
} as gameType;

describe('tests for game validation', () => {

  describe('gotGameData', () => {
    it('should return ErrorCode.NONE for valid game data', () => {
      expect(gotGameData(validGame)).toBe(ErrorCode.NONE);
    })
    it('should return ErrorCode.MISSING_DATA for missing', () => {
      const testGame = {
        ...validGame,
        id: null as any,
      }
      expect(gotGameData(testGame)).toBe(ErrorCode.MISSING_DATA);
    })
    it('should return ErrorCode.MISSING_DATA for missing squad_id', () => {
      const testGame = {
        ...validGame,
        squad_id: null as any,
      }
      expect(gotGameData(testGame)).toBe(ErrorCode.MISSING_DATA);
    })
    it('should return ErrorCode.MISSING_DATA for missing player_id', () => {
      const testGame = {
        ...validGame,
        player_id: null as any,
      }
      expect(gotGameData(testGame)).toBe(ErrorCode.MISSING_DATA);
    })
    it('should return ErrorCode.MISSING_DATA for missing game_num', () => {
      const testGame = {
        ...validGame,
        game_num: null as any,
      }
      expect(gotGameData(testGame)).toBe(ErrorCode.MISSING_DATA);
    })
    it('should return ErrorCode.MISSING_DATA for missing squad_id', () => {
      const testGame = {
        ...validGame,
        score: null as any,
      }
      expect(gotGameData(testGame)).toBe(ErrorCode.MISSING_DATA);
    })
    it('should return ErrorCode.MISSING_DATA is passed null', () => {
      expect(gotGameData(null as any)).toBe(ErrorCode.MISSING_DATA);
    })
  })

  describe("validGameFkId function", () => {
    it("should return true for valid squad_id", () => {
      expect(validGameFkId(validGame.squad_id, "sqd")).toBe(true);      
    });
    it("should return true for valid player_id", () => {
      expect(validGameFkId(validGame.player_id, "ply")).toBe(true);      
    });
    it("should return false for invalid foreign key id", () => {
      expect(validGameFkId("abc_def", "sqd")).toBe(false);
    });
    it("should return false if foreign key id type does not match id type", () => {
      expect(validGameFkId(validGame.squad_id, "usr")).toBe(false);
    });
    it("should return false for an empty foreign key id", () => {
      expect(validGameFkId("", "sqd")).toBe(false);
    });
    it("should return false for an null foreign key id", () => {
      expect(validGameFkId(null as any, "sqd")).toBe(false);
    });
    it("should return false for an null key type", () => {
      expect(validGameFkId(validGame.squad_id, null as any)).toBe(false);
    });
  });

  describe('validGameNumber', () => { 
    it('should return true for valid game number', () => { 
      expect(validGameNumber(1)).toBe(true);
    })
    it('should return false for game number too low', () => { 
      expect(validGameNumber(0)).toBe(false);
    })
    it('should return false for game number too high', () => { 
      expect(validGameNumber(maxGames + 1)).toBe(false);
    })
    it('should return false for game number not an integer', () => { 
      expect(validGameNumber(1.2)).toBe(false);
    })
    it('should return false for game number not a number', () => { 
      expect(validGameNumber('abc' as any)).toBe(false);      
    })
    it('should return false for game number is null', () => { 
      expect(validGameNumber(null as any)).toBe(false);      
    })
  })

  describe('validScore', () => { 
    it('should return true for valid score', () => { 
      expect(validScore(123)).toBe(true);
    })
    it('should return false for score too low', () => { 
      expect(validScore(-1)).toBe(false);
    })
    it('should return false for score too high', () => { 
      expect(validScore(maxScore + 1)).toBe(false);
    })
    it('should return false for score not an integer', () => { 
      expect(validScore(123.45)).toBe(false);
    })
    it('should return false for score not a number', () => { 
      expect(validScore('abc' as any)).toBe(false);      
    })
    it('should return false for game number is null', () => { 
      expect(validScore(null as any)).toBe(false);      
    })
  })

  describe('validGameData', () => { 
    it('should return ErrorCode.NONE for valid game data', () => { 
      expect(validGameData(validGame)).toBe(ErrorCode.NONE);
    })
    it('should return ErrorCode.INVALID_DATA for missing id', () => { 
      const testGame = {
        ...validGame,
        id: '',
      }
      expect(validGameData(testGame)).toBe(ErrorCode.INVALID_DATA);
    })
    it('should return ErrorCode.INVALID_DATA when id is valid, but not a game id', () => { 
      const testGame = {
        ...validGame,
        id: 'pot_b2a7b02d761b4f5ab5438be84f642c3b',
      }
      expect(validGameData(testGame)).toBe(ErrorCode.INVALID_DATA);
    })
    it('should return ErrorCode.INVALID_DATA when id is invalid', () => { 
      const testGame = {
        ...validGame,
        id: 'abc',
      }
      expect(validGameData(testGame)).toBe(ErrorCode.INVALID_DATA);
    })
    it('should return ErrorCode.INVALID_DATA for missing squad_id', () => { 
      const testGame = {
        ...validGame,
        squad_id: '',
      }
      expect(validGameData(testGame)).toBe(ErrorCode.INVALID_DATA);
    })
    it('should return ErrorCode.INVALID_DATA when squad_id is valid, but not a squad id', () => { 
      const testGame = {
        ...validGame,
        squad_id: 'pot_b2a7b02d761b4f5ab5438be84f642c3b',
      }
      expect(validGameData(testGame)).toBe(ErrorCode.INVALID_DATA);
    })
    it('should return ErrorCode.INVALID_DATA when squad_id is invalid', () => { 
      const testGame = {
        ...validGame,
        squad_id: 'abc',
      }
      expect(validGameData(testGame)).toBe(ErrorCode.INVALID_DATA);
    })
    it('should return ErrorCode.INVALID_DATA for missing player_id', () => { 
      const testGame = {
        ...validGame,
        player_id: '',
      }
      expect(validGameData(testGame)).toBe(ErrorCode.INVALID_DATA);
    })
    it('should return ErrorCode.INVALID_DATA when player_id is valid, but not a player id', () => { 
      const testGame = {
        ...validGame,
        player_id: 'pot_b2a7b02d761b4f5ab5438be84f642c3b',
      }
      expect(validGameData(testGame)).toBe(ErrorCode.INVALID_DATA);
    })
    it('should return ErrorCode.INVALID_DATA when player_id is invalid', () => { 
      const testGame = {
        ...validGame,
        player_id: 'abc',
      }
      expect(validGameData(testGame)).toBe(ErrorCode.INVALID_DATA);
    })
    it('should return ErrorCode.INVALID_DATA when game_num is too low', () => { 
      const testGame = {
        ...validGame,
        game_num: 0,
      }
      expect(validGameData(testGame)).toBe(ErrorCode.INVALID_DATA);
    })
    it('should return ErrorCode.INVALID_DATA when game_num is too high', () => { 
      const testGame = {
        ...validGame,
        game_num: maxGames + 1,
      }
      expect(validGameData(testGame)).toBe(ErrorCode.INVALID_DATA);
    })
    it('should return ErrorCode.INVALID_DATA when game_num is not a number', () => { 
      const testGame = {
        ...validGame,
        game_num: 'abc' as any
      }
      expect(validGameData(testGame)).toBe(ErrorCode.INVALID_DATA);
    })
    it('should return ErrorCode.INVALID_DATA when game_num is not an integer', () => { 
      const testGame = {
        ...validGame,
        game_num: 1.2
      }
      expect(validGameData(testGame)).toBe(ErrorCode.INVALID_DATA);
    })
    it('should return ErrorCode.INVALID_DATA when score is too low', () => { 
      const testGame = {
        ...validGame,
        score: -1,
      }
      expect(validGameData(testGame)).toBe(ErrorCode.INVALID_DATA);
    })
    it('should return ErrorCode.INVALID_DATA when score is too high', () => { 
      const testGame = {
        ...validGame,
        game_num: maxScore + 1,
      }
      expect(validGameData(testGame)).toBe(ErrorCode.INVALID_DATA);
    })
    it('should return ErrorCode.INVALID_DATA when score is not a number', () => { 
      const testGame = {
        ...validGame,
        score: 'abc' as any
      }
      expect(validGameData(testGame)).toBe(ErrorCode.INVALID_DATA);
    })
    it('should return ErrorCode.INVALID_DATA when score is not an integer', () => { 
      const testGame = {
        ...validGame,
        score: 12.3
      }
      expect(validGameData(testGame)).toBe(ErrorCode.INVALID_DATA);
    })
        
  })

  describe('sanitizeGame', () => { 
    it('should return sanitzied game when game already sanitized', () => {
      const sanitizedGame = sanitizeGame(validGame);
      expect(sanitizedGame).toEqual(validGame);
    })
    it('should return a sanitized game when id is invalid', () => { 
      const testGame = {
        ...validGame,
        id: '<script>Game</script>',
      }
      const sanitizedGame = sanitizeGame(testGame);
      expect(sanitizedGame.id).toBe('');
    })
    it('should return a sanitized game when squad_id is invalid', () => { 
      const testGame = {
        ...validGame,
        squad_id: '<script>Game</script>',
      }
      const sanitizedGame = sanitizeGame(testGame);
      expect(sanitizedGame.squad_id).toBe('');
    })
    it('should return a sanitized game when player_id is invalid', () => { 
      const testGame = {
        ...validGame,
        player_id: '<script>Game</script>',
      }
      const sanitizedGame = sanitizeGame(testGame);
      expect(sanitizedGame.player_id).toBe('');
    })
    it('should return a sanitized game when game_num is invalid', () => { 
      const testGame = {
        ...validGame,
        game_num: 'abc' as any,
      }
      const sanitizedGame = sanitizeGame(testGame);
      expect(sanitizedGame.game_num).toBe(0);
    })
    it('should return a sanitized game when score is invalid', () => { 
      const testGame = {
        ...validGame,
        score: 'abc' as any,
      }
      const sanitizedGame = sanitizeGame(testGame);
      expect(sanitizedGame.score).toBe(0);
    })
  })

  describe('validateGame', () => { 
    
    describe('validateGame function - valid data', () => { 
      it('should return ErrorCode.NONE when all data is valid', () => { 
        expect(validateGame(validGame)).toBe(ErrorCode.NONE);
      })
    })
    
    describe('validateGame function - missing data', () => { 
      it('should return ErrorCode.MISSING_DATA when id is missing', () => { 
        const testGame = {
          ...validGame,
          id: '',
        }
        expect(validateGame(testGame)).toBe(ErrorCode.MISSING_DATA);
      })
      it('should return ErrorCode.MISSING_DATA when squad_id is missing', () => { 
        const testGame = {
          ...validGame,
          squad_id: '',
        }
        expect(validateGame(testGame)).toBe(ErrorCode.MISSING_DATA);
      })
      it('should return ErrorCode.MISSING_DATA when player_id is missing', () => { 
        const testGame = {
          ...validGame,
          player_id: '',
        }
        expect(validateGame(testGame)).toBe(ErrorCode.MISSING_DATA);
      })
      it('should return ErrorCode.MISSING_DATA when game_num is null', () => { 
        const testGame = {
          ...validGame,
          game_num: null as any,
        }
        expect(validateGame(testGame)).toBe(ErrorCode.MISSING_DATA);
      })
      it('should return ErrorCode.MISSING_DATA when score is null', () => { 
        const testGame = {
          ...validGame,
          score: null as any,
        }
        expect(validateGame(testGame)).toBe(ErrorCode.MISSING_DATA);
      })
    })

    describe('validateGame function - invalid data', () => { 
      it('should return ErrorCode.INVALID_DATA when id is invalid', () => { 
        const testGame = {
          ...validGame,
          id: 'abc',
        }
        expect(validateGame(testGame)).toBe(ErrorCode.INVALID_DATA);
      })
      it('should return ErrorCode.INVALID_DATA when squad_id is invalid', () => { 
        const testGame = {
          ...validGame,
          squad_id: 'abc',
        }
        expect(validateGame(testGame)).toBe(ErrorCode.INVALID_DATA);
      })
      it('should return ErrorCode.INVALID_DATA when player_id is invalid', () => { 
        const testGame = {
          ...validGame,
          player_id: 'abc',
        }
        expect(validateGame(testGame)).toBe(ErrorCode.INVALID_DATA);
      })
      it('should return ErrorCode.INVALID_DATA when game_num is invalid', () => { 
        const testGame = {
          ...validGame,
          game_num: 12.3,
        }
        expect(validateGame(testGame)).toBe(ErrorCode.INVALID_DATA);
      })
      it('should return ErrorCode.INVALID_DATA when score is invalid', () => { 
        const testGame = {
          ...validGame,
          score: 123.45,
        }
        expect(validateGame(testGame)).toBe(ErrorCode.INVALID_DATA);
      })
    })

  })

  describe('validdateGames', () => { 

    it('should validate games with id set and required', () => { 
      const validGames: validGamesType = validateGames(mockGamesToPost);
      expect(validGames.errorCode).toBe(ErrorCode.NONE);
      expect(validGames.games.length).toBe(mockGamesToPost.length);
      for (let i = 0; i < mockGamesToPost.length; i++) {
        expect(validGames.games[i].id).toBe(mockGamesToPost[i].id)
        expect(validGames.games[i].squad_id).toBe(mockGamesToPost[i].squad_id)
        expect(validGames.games[i].player_id).toBe(mockGamesToPost[i].player_id)
        expect(validGames.games[i].game_num).toBe(mockGamesToPost[i].game_num)
        expect(validGames.games[i].score).toBe(mockGamesToPost[i].score)
      }
    })
    it('should return ErrorCode.MISSING_DATA when id is invalid then sanitized', () => { 
      const invalidData = [
        {
          ...mockGamesToPost[0],
          id: '<script>Game</script>' as any, 
        },
        {
          ...mockGamesToPost[1],          
        },
        {
          ...mockGamesToPost[2],          
        },
      ]
      const validGames: validGamesType = validateGames(invalidData);
      expect(validGames.errorCode).toBe(ErrorCode.MISSING_DATA);      
    })
    it('should return ErrorCode.MISSING_DATA when id is null', () => { 
      const invalidData = [
        {
          ...mockGamesToPost[0],
          id: null as any, 
        },
        {
          ...mockGamesToPost[1],          
        },
        {
          ...mockGamesToPost[2],          
        },
      ]
      const validGames: validGamesType = validateGames(invalidData);
      expect(validGames.errorCode).toBe(ErrorCode.MISSING_DATA);
    })
    it('should return ErrorCode.MISSING_DATA when squad_id is blank', () => { 
      const invalidData = [
        {
          ...mockGamesToPost[0],
          squad_id: '', 
        },
        {
          ...mockGamesToPost[1],          
        },
        {
          ...mockGamesToPost[2],          
        },
      ]
      const validGames: validGamesType = validateGames(invalidData);
      expect(validGames.errorCode).toBe(ErrorCode.MISSING_DATA);
    })
    it('should return ErrorCode.MISSING_DATA when squad_id is null', () => { 
      const invalidData = [
        {
          ...mockGamesToPost[0],
          squad_id: null as any, 
        },
        {
          ...mockGamesToPost[1],          
        },
        {
          ...mockGamesToPost[2],          
        },
      ]
      const validGames: validGamesType = validateGames(invalidData);
      expect(validGames.errorCode).toBe(ErrorCode.MISSING_DATA);
    })
    it('should return ErrorCode.MISSING_DATA when squad_id is invalid', () => { 
      const invalidData = [
        {
          ...mockGamesToPost[0],
          squad_id: 'abc',
        },
        {
          ...mockGamesToPost[1],          
        },
        {
          ...mockGamesToPost[2],          
        },
      ]
      const validGames: validGamesType = validateGames(invalidData);
      expect(validGames.errorCode).toBe(ErrorCode.MISSING_DATA);
    })
    it('should return ErrorCode.MISSING_DATA when player_id is blank', () => { 
      const invalidData = [
        {
          ...mockGamesToPost[0],
          player_id: '', 
        },
        {
          ...mockGamesToPost[1],          
        },
        {
          ...mockGamesToPost[2],          
        },
      ]
      const validGames: validGamesType = validateGames(invalidData);
      expect(validGames.errorCode).toBe(ErrorCode.MISSING_DATA);
    })
    it('should return ErrorCode.MISSING_DATA when player_id is null', () => { 
      const invalidData = [
        {
          ...mockGamesToPost[0],
          player_id: null as any, 
        },
        {
          ...mockGamesToPost[1],          
        },
        {
          ...mockGamesToPost[2],          
        },
      ]
      const validGames: validGamesType = validateGames(invalidData);
      expect(validGames.errorCode).toBe(ErrorCode.MISSING_DATA);
    })
    it('should return ErrorCode.MISSING_DATA when player_id is invalid', () => { 
      const invalidData = [
        {
          ...mockGamesToPost[0],
          player_id: 'abc',
        },
        {
          ...mockGamesToPost[1],          
        },
        {
          ...mockGamesToPost[2],          
        },
      ]
      const validGames: validGamesType = validateGames(invalidData);
      expect(validGames.errorCode).toBe(ErrorCode.MISSING_DATA);
    })
    it('should return ErrorCode.MISSING_DATA when game_num is null', () => { 
      const invalidData = [
        {
          ...mockGamesToPost[0],
          game_num: null as any, 
        },
        {
          ...mockGamesToPost[1],          
        },
        {
          ...mockGamesToPost[2],          
        },
      ]
      const validGames: validGamesType = validateGames(invalidData);
      expect(validGames.errorCode).toBe(ErrorCode.MISSING_DATA);
    })
    it('should return ErrorCode.MISSING_DATA when score is null', () => { 
      const invalidData = [
        {
          ...mockGamesToPost[0],
          score: null as any, 
        },
        {
          ...mockGamesToPost[1],          
        },
        {
          ...mockGamesToPost[2],          
        },
      ]
      const validGames: validGamesType = validateGames(invalidData);
      expect(validGames.errorCode).toBe(ErrorCode.MISSING_DATA);
    })
    it('should return ErrorCode.INVALID_DATA when game_num is invalid', () => { 
      const invalidData = [
        {
          ...mockGamesToPost[0],
          game_num: maxGames + 1,
        },
        {
          ...mockGamesToPost[1],          
        },
        {
          ...mockGamesToPost[2],          
        },
      ]
      const validGames: validGamesType = validateGames(invalidData);
      expect(validGames.errorCode).toBe(ErrorCode.INVALID_DATA);
    })
    it('should return ErrorCode.INVALID_DATA when score is invalid', () => { 
      const invalidData = [
        {
          ...mockGamesToPost[0],
          score: -1,
        },
        {
          ...mockGamesToPost[1],          
        },
        {
          ...mockGamesToPost[2],          
        },
      ]
      const validGames: validGamesType = validateGames(invalidData);
      expect(validGames.errorCode).toBe(ErrorCode.INVALID_DATA);
    })

  })
})