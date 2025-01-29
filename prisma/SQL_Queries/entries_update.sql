given the data entry grid and data tables, what is the best way to 
do a SQL batch update to the from the Data Entry Grid to the Sales table
also include the SQL code for new rows added to the Data Entry Grid
and rows deleted from Team table and Sales table

Data Entry Grid
Id | Name | Apples | Bananas | Cherries |
---+------+--------+---------+----------+
1  | Bob  |     10 |      20 |       30 |
2  | Tom  |     15 |      25 |       35 |
3  | Joe  |     18 |      28 |       38 |

new rows added to the Data Entry Grid
Id | Name | Apples | Bananas | Cherries |
---+------+--------+---------+----------+
5  | Sam  |     12 |      22 |       32 |
6  | Pat  |     16 |      26 |       36 | 

deleted row removed from the Data Entry Grid
Id | Name | Apples | Bananas | Cherries |
---+------+--------+---------+----------+
4  | Art  |     13 |      23 |       33 |


Data Tables:
Team:
Id | Name |
---+------+
1  | Bob  |
2  | Tom  |
3  | Joe  |
5  | Sam  |
6  | Pat  |

Fruit:
Id | Name     |
---+----------+   
10 | Apples   |
11 | Bananas  |
12 | Cherries |

Sales:
Id  | Fruit Id | Sales Id | Amount |
----+----------+----------+--------+
100 |       10 |        1 |     10 |
101 |       11 |        1 |     20 |
102 |       12 |        1 |     30 |
103 |       10 |        2 |     15 |
104 |       11 |        2 |     25 |
105 |       12 |        2 |     35 |
106 |       10 |        3 |     18 |
107 |       11 |        3 |     28 |
108 |       12 |        3 |     38 |

deleted from Team:
Id | Name |
---+------+
4  | Art  |

deleted from Sales:
Id  | Fruit Id | Sales Id | Amount |
----+----------+----------+--------+
109 |       10 |        4 |     13 | 
110 |       11 |        4 |     23 | 
111 |       12 |        4 |     33 | 

added to Team:
Id | Name |
---+------+
5  | Sam  |
6  | Pat  |

added to Sales:
Id  | Fruit Id | Sales Id | Amount |
----+----------+----------+--------+
112 |       10 |        5 |     12 | 
113 |       11 |        5 |     22 | 
114 |       12 |        5 |     32 | 
115 |       10 |        6 |     16 | 
116 |       11 |        6 |     26 | 
117 |       12 |        6 |     36 |

-- 1 updated existing rows in the sales table
UPDATE Sales
SET Amount = CASE 
  WHEN Fruit_Id = 10 THEN d.Apples
  WHEN Fruit_Id = 11 THEN d.Bananas
  WHEN Fruit_Id = 12 THEN d.Cherries
END
FROM (
  VALUES 
    (1, 10, 20, 30),  -- Sales Id, Apples, Bananas, Cherries from Data Entry Grid
    (2, 15, 25, 35),
    (3, 18, 28, 38)
) AS d(Sales_Id, Apples, Bananas, Cherries)
WHERE Sales.Sales_Id = d.Sales_Id AND Sales.Fruit_Id IN (10, 11, 12);

-- 2a new rows added to the team table
INSERT INTO Team (Id, Name)
SELECT d.Id, d.Name
FROM (
  VALUES 
    (5, 'Sam'),
    (6, 'Pat')
) AS d(Id, Name)
WHERE NOT EXISTS (
  SELECT 1 FROM Team t WHERE t.Id = d.Id
);

-- 2b new rows added to the sales table
INSERT INTO Sales (Fruit_Id, Sales_Id, Amount)
SELECT f.Id AS Fruit_Id, d.Sales_Id, d.Amount
FROM (
  VALUES 
    (5, 10, 12),  -- Sales Id, Fruit Id, Amount for Apples
    (5, 11, 22),  -- Sales Id, Fruit Id, Amount for Bananas
    (5, 12, 32),  -- Sales Id, Fruit Id, Amount for Cherries
    (6, 10, 16),  -- Sales Id, Fruit Id, Amount for Apples
    (6, 11, 26),  -- Sales Id, Fruit Id, Amount for Bananas
    (6, 12, 36)   -- Sales Id, Fruit Id, Amount for Cherries
) AS d(Sales_Id, Fruit_Id, Amount)
JOIN Fruit f ON f.Id = d.Fruit_Id
WHERE NOT EXISTS (
  SELECT 1
  FROM Sales s
  WHERE s.Sales_Id = d.Sales_Id AND s.Fruit_Id = d.Fruit_Id
);

-- 3a deleted rows removed from the sales table
DELETE FROM Sales
WHERE Sales_Id NOT IN (SELECT Id FROM Team);

-- 3b deleted rows removed from the team table
DELETE FROM Team
WHERE Id NOT IN (
  SELECT Id
  FROM (
    VALUES 
      (1, 'Bob'),
      (2, 'Tom'),
      (3, 'Joe'),
      (5, 'Sam'),
      (6, 'Pat')
  ) AS d(Id, Name)
);

-- OR ---

-- Update existing rows in the Sales table based on the Data Entry Grid
UPDATE Sales
SET Amount = CASE
    WHEN FruitId = 10 THEN DataEntry.Apples
    WHEN FruitId = 11 THEN DataEntry.Bananas
    WHEN FruitId = 12 THEN DataEntry.Cherries
END
FROM Sales
JOIN Team ON Sales.SalesId = Team.Id
JOIN (
    VALUES
        (1, 'Bob', 10, 20, 30),
        (2, 'Tom', 15, 25, 35),
        (3, 'Joe', 18, 28, 38)
) AS DataEntry(Id, Name, Apples, Bananas, Cherries)
ON Team.Id = DataEntry.Id;

-- Insert new rows into the Sales table for new entries in the Data Entry Grid
INSERT INTO Sales (FruitId, SalesId, Amount)
SELECT Fruit.Id, Team.Id, DataEntry.Amount
FROM (
    VALUES
        (5, 'Sam', 12, 22, 32),
        (6, 'Pat', 16, 26, 36)
) AS DataEntry(Id, Name, Apples, Bananas, Cherries)
CROSS JOIN Fruit
JOIN Team ON Team.Id = DataEntry.Id
WHERE Fruit.Name IN ('Apples', 'Bananas', 'Cherries')
AND (
    (Fruit.Name = 'Apples' AND DataEntry.Apples IS NOT NULL) OR
    (Fruit.Name = 'Bananas' AND DataEntry.Bananas IS NOT NULL) OR
    (Fruit.Name = 'Cherries' AND DataEntry.Cherries IS NOT NULL)
);

-- Delete rows from the Sales table for deleted entries in the Team table
DELETE FROM Sales
WHERE SalesId = 4;

-- Delete rows from the Team table for deleted entries
DELETE FROM Team
WHERE Id = 4;

---------------------------------------------------
given the data entry grid and data tables, what is the best way to 
do a SQL batch update to the from the Data Entry Grid to the Team table?

also include the SQL code for new rows added to the Data Entry Grid
and rows deleted from Team table 

Data Entry Grid
edited rows in Data Entry grid
Id | First | Last  |
---+-------+-------+
1  | Bob   | Ewing |
3  | Joe   | Black |

new rows added to the Data Entry Grid
Id | First | Last  |
---+-------+-------+
6  | Sam   | Clink |
7  | Pat   | Long  |

deleted rows removed from the Data Entry Grid
Id | First | Last  |
---+-------+-------+
4  | Art   | Green |
5  | Ed    | Owens |

Original Data:
Team:
Id | First | Last  |
---+-------+-------+
1  | Bob   | Smith |
2  | Tom   | Jones |
3  | Joe   | White |
4  | Art   | Green |
5  | Ed    | Owens |

After update Data:
Team:
Id | First | Last  |
---+-------+-------+
1  | Bob   | Ewing |
2  | Tom   | Jones |
3  | Joe   | Black |
6  | Sam   | Clink |
7  | Pat   | Long  |

-- Update existing rows in the Team table based on the Data Entry Grid
-- Update existing rows in the Team table based on the Data Entry Grid
UPDATE Team
SET First = DataEntry.First, Last = DataEntry.Last
FROM Team
JOIN (
    VALUES
        (1, 'Bob', 'Ewing'),
        (3, 'Joe', 'Black')
) AS DataEntry(Id, First, Last)
ON Team.Id = DataEntry.Id;

-- Insert new rows into the Team table for new entries in the Data Entry Grid
INSERT INTO Team (Id, First, Last)
SELECT DataEntry.Id, DataEntry.First, DataEntry.Last
FROM (
    VALUES
        (6, 'Sam', 'Clink'),
        (7, 'Pat', 'Long')
) AS DataEntry(Id, First, Last)
WHERE NOT EXISTS (
    SELECT 1 FROM Team t WHERE t.Id = DataEntry.Id
);

-- Delete rows from the Team table for entries removed from the Data Entry Grid
DELETE FROM Team
WHERE Id IN (4, 5);

-- OR 

-- Update existing rows
UPDATE Team
SET First = DE.First, Last = DE.Last
FROM Team T
JOIN (VALUES 
        (1, 'Bob', 'Ewing'),
        (2, 'Tom', 'Jones'),
        (3, 'Joe', 'Black')
     ) AS DE(Id, First, Last)
     ON T.Id = DE.Id;

-- Insert new rows
INSERT INTO Team (Id, First, Last)
VALUES 
    (5, 'Sam', 'Clink'), 
    (6, 'Pat', 'Long');

-- Delete removed rows
DELETE FROM Team
WHERE Id = 4;
