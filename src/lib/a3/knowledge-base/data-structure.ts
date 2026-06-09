import type {
  ConceptSearchResult,
  CourseChapter,
  CourseKnowledgeBase,
} from "./types";

export const dataStructureKnowledgeBase: CourseKnowledgeBase = {
  id: "data-structure",
  title: "数据结构",
  description:
    "面向高校计算机类专业的核心基础课程知识库，覆盖抽象数据类型、线性结构、树、图、查找与排序等内容，可作为 A3 赛题中学习画像、路径规划、资源生成和效果评估的课程依据。",
  audience: "计算机类、软件工程、人工智能、数据科学等专业本科低年级学生",
  chapters: [
    {
      id: "introduction",
      order: 1,
      title: "绪论",
      introduction:
        "绪论建立数据结构课程的基本语言，帮助学生理解数据、数据元素、逻辑结构、存储结构、抽象数据类型与算法效率分析之间的关系。",
      learningObjectives: [
        "理解数据结构研究对象与抽象数据类型的表达方式",
        "区分逻辑结构、存储结构和数据运算的不同层次",
        "掌握时间复杂度和空间复杂度的基本分析方法",
      ],
      coreConcepts: [
        concept("data", "数据与数据元素", "数据是信息的符号表示，数据元素是组成数据的基本单位。", [
          "数据",
          "数据元素",
          "数据项",
        ]),
        concept("logical-structure", "逻辑结构", "描述元素之间的逻辑关系，常见类型包括集合、线性、树形和图状结构。", [
          "集合结构",
          "线性结构",
          "树形结构",
          "图结构",
        ]),
        concept("storage-structure", "存储结构", "数据在计算机中的表示方式，包括顺序、链式、索引和散列存储。", [
          "顺序存储",
          "链式存储",
          "散列存储",
        ]),
        concept("adt", "抽象数据类型", "用数据对象、数据关系和基本操作描述数据结构的抽象模型。", [
          "ADT",
          "数据对象",
          "基本操作",
        ]),
        concept("complexity", "算法复杂度", "用数量级描述算法执行时间和额外空间随输入规模增长的趋势。", [
          "时间复杂度",
          "空间复杂度",
          "大 O 表示法",
        ]),
      ],
      keyDifficulties: [
        "从问题语义中抽象出逻辑结构，而不是直接陷入代码实现",
        "区分最坏、平均和最好时间复杂度的使用场景",
        "理解同一逻辑结构可以有多种存储结构实现",
      ],
      commonMistakes: [
        "把逻辑结构和存储结构混为一谈",
        "复杂度分析只数循环层数，忽略循环变量变化方式",
        "认为常数时间一定比线性时间在所有输入规模下更快",
      ],
      questionTypes: [
        "给定代码片段分析时间复杂度",
        "判断某个应用问题适合的逻辑结构",
        "比较顺序存储和链式存储的优缺点",
      ],
      codeExamples: [
        {
          id: "complexity-loop",
          title: "对数复杂度循环",
          language: "TypeScript",
          description: "通过倍增循环理解 O(log n) 的来源。",
          code: `function countHalvingSteps(n: number) {
  let steps = 0;
  while (n > 1) {
    n = Math.floor(n / 2);
    steps += 1;
  }
  return steps;
}`,
          highlights: [
            "循环变量每次减半",
            "执行次数与 log2(n) 同阶",
          ],
        },
      ],
      reviewSuggestions: [
        "用一张表对比逻辑结构与存储结构",
        "每天选 3 段代码手算复杂度并写出依据",
        "把 ADT 的数据对象、关系、操作三部分单独整理成模板",
      ],
    },
    {
      id: "linear-list",
      order: 2,
      title: "线性表",
      introduction:
        "线性表是最基础的线性结构，重点学习顺序表和链表的存储特点、插入删除复杂度、边界条件与典型应用。",
      learningObjectives: [
        "理解线性表的定义和基本操作",
        "掌握顺序表与单链表的实现差异",
        "能够分析插入、删除、查找操作的复杂度",
      ],
      coreConcepts: [
        concept("linear-list", "线性表", "由有限个同类型数据元素组成，除首尾外每个元素有唯一前驱和唯一后继。", [
          "线性结构",
          "前驱",
          "后继",
        ]),
        concept("sequential-list", "顺序表", "用连续存储空间保存线性表元素，支持随机访问。", [
          "数组",
          "随机访问",
          "顺序存储",
        ]),
        concept("linked-list", "单链表", "用结点和指针表示元素之间的先后关系，插入删除更灵活。", [
          "结点",
          "指针",
          "链式存储",
        ]),
        concept("double-linked-list", "双链表", "每个结点同时保存前驱和后继指针，便于双向遍历。", [
          "prev",
          "next",
          "双向遍历",
        ]),
        concept("circular-list", "循环链表", "尾结点指向头结点，适合循环调度和约瑟夫问题。", [
          "循环链表",
          "约瑟夫环",
          "尾指针",
        ]),
      ],
      keyDifficulties: [
        "链表插入删除时指针更新顺序容易出错",
        "顺序表扩容和元素移动成本需要结合场景分析",
        "头结点、头指针和首元结点的概念容易混淆",
      ],
      commonMistakes: [
        "删除链表结点后继续访问已断开的结点",
        "忘记处理空表、单结点表和尾结点边界",
        "把链表查找误认为可以像数组一样随机访问",
      ],
      questionTypes: [
        "实现单链表逆置、合并和删除指定值",
        "比较顺序表与链表在不同操作下的复杂度",
        "分析约瑟夫环、LRU 等线性表应用",
      ],
      codeExamples: [
        {
          id: "reverse-linked-list",
          title: "单链表逆置",
          language: "TypeScript",
          description: "使用三个指针原地逆置单链表。",
          code: `type Node<T> = { value: T; next: Node<T> | null };

function reverseList<T>(head: Node<T> | null) {
  let prev: Node<T> | null = null;
  let current = head;
  while (current) {
    const next = current.next;
    current.next = prev;
    prev = current;
    current = next;
  }
  return prev;
}`,
          highlights: [
            "先保存 next，避免链表断裂",
            "prev 最终成为新的头结点",
          ],
        },
      ],
      reviewSuggestions: [
        "画图跟踪链表插入、删除、逆置的指针变化",
        "按空表、单元素、多元素三类样例测试链表代码",
        "整理顺序表和链表在查找、插入、删除上的复杂度对比",
      ],
    },
    {
      id: "stacks-queues",
      order: 3,
      title: "栈和队列",
      introduction:
        "栈和队列是受限线性表，分别体现后进先出和先进先出的访问规则，是表达式求值、递归、缓冲和广度优先搜索的基础。",
      learningObjectives: [
        "掌握栈和队列的抽象操作与存储实现",
        "理解循环队列的判空、判满和取模移动",
        "能够用栈和队列解决典型算法问题",
      ],
      coreConcepts: [
        concept("stack", "栈", "只允许在栈顶插入和删除的线性结构，遵循后进先出。", [
          "LIFO",
          "栈顶",
          "压栈",
          "出栈",
        ]),
        concept("queue", "队列", "只允许队尾入队、队头出队的线性结构，遵循先进先出。", [
          "FIFO",
          "队头",
          "队尾",
        ]),
        concept("circular-queue", "循环队列", "用取模方式复用顺序存储空间，常牺牲一个位置区分满和空。", [
          "front",
          "rear",
          "取模",
        ]),
        concept("expression-evaluation", "表达式求值", "用操作数栈和运算符栈处理优先级和括号。", [
          "中缀表达式",
          "后缀表达式",
          "优先级",
        ]),
        concept("recursion-stack", "递归栈", "函数调用会形成隐式栈帧，可用显式栈模拟递归过程。", [
          "栈帧",
          "递归",
          "回溯",
        ]),
      ],
      keyDifficulties: [
        "循环队列中 front、rear 的含义和移动时机",
        "表达式转换与求值时运算符优先级处理",
        "递归过程与栈结构之间的对应关系",
      ],
      commonMistakes: [
        "循环队列判满条件写成 rear === front",
        "出栈或出队前不判断空结构",
        "括号匹配时忽略不同类型括号的对应关系",
      ],
      questionTypes: [
        "括号匹配和表达式求值",
        "循环队列判空判满与队列长度计算",
        "用队列实现层次遍历或广度优先搜索",
      ],
      codeExamples: [
        {
          id: "valid-parentheses",
          title: "括号匹配",
          language: "TypeScript",
          description: "使用栈判断括号字符串是否合法。",
          code: `function isValidParentheses(input: string) {
  const stack: string[] = [];
  const pairs: Record<string, string> = { ")": "(", "]": "[", "}": "{" };
  for (const char of input) {
    if (["(", "[", "{"].includes(char)) stack.push(char);
    if ([")", "]", "}"].includes(char) && stack.pop() !== pairs[char]) {
      return false;
    }
  }
  return stack.length === 0;
}`,
          highlights: [
            "左括号入栈，右括号检查栈顶",
            "遍历结束后栈必须为空",
          ],
        },
      ],
      reviewSuggestions: [
        "手动画出循环队列 front/rear 的变化过程",
        "把括号匹配、表达式求值和 BFS 分别归纳为栈/队列模板",
        "对每个栈队列算法补充空结构和单元素测试",
      ],
    },
    {
      id: "strings",
      order: 4,
      title: "串",
      introduction:
        "串是由字符组成的特殊线性表，重点在模式匹配、KMP 算法、next 数组和文本处理场景。",
      learningObjectives: [
        "理解串的定义、存储方式和基本操作",
        "掌握朴素模式匹配和 KMP 的差异",
        "能够手算简单模式串的 next 数组",
      ],
      coreConcepts: [
        concept("string", "串", "由零个或多个字符组成的有限序列，空串长度为 0。", [
          "字符序列",
          "空串",
          "子串",
        ]),
        concept("pattern-matching", "模式匹配", "在主串中查找模式串首次出现位置的过程。", [
          "主串",
          "模式串",
          "匹配位置",
        ]),
        concept("naive-match", "朴素匹配", "从每个可能起点逐字符比较，最坏时间复杂度较高。", [
          "暴力匹配",
          "回溯",
          "O(nm)",
        ]),
        concept("kmp", "KMP 算法", "利用模式串自身前后缀信息减少主串指针回退。", [
          "KMP",
          "前缀",
          "后缀",
        ]),
        concept("next-array", "next 数组", "记录模式串失配时应回退的位置，是 KMP 的核心辅助信息。", [
          "next",
          "最长相等前后缀",
          "失配跳转",
        ]),
      ],
      keyDifficulties: [
        "next 数组不同教材定义可能有下标偏移",
        "理解 KMP 只移动模式串而不回退主串指针",
        "把最长相等前后缀和完整子串匹配区分开",
      ],
      commonMistakes: [
        "计算 next 数组时把整个字符串也当作前后缀",
        "失配后同时回退主串和模式串",
        "忽略空串、单字符串和重复字符模式串",
      ],
      questionTypes: [
        "手算模式串 next 数组",
        "比较朴素匹配与 KMP 的匹配过程",
        "实现 substring、indexOf 或模式匹配函数",
      ],
      codeExamples: [
        {
          id: "build-lps",
          title: "构建 KMP LPS 数组",
          language: "TypeScript",
          description: "使用最长相等前后缀数组描述模式串自匹配信息。",
          code: `function buildLps(pattern: string) {
  const lps = Array(pattern.length).fill(0);
  let length = 0;
  for (let i = 1; i < pattern.length;) {
    if (pattern[i] === pattern[length]) {
      lps[i++] = ++length;
    } else if (length > 0) {
      length = lps[length - 1];
    } else {
      lps[i++] = 0;
    }
  }
  return lps;
}`,
          highlights: [
            "length 表示当前最长相等前后缀长度",
            "失配时用已知 lps 缩短比较范围",
          ],
        },
      ],
      reviewSuggestions: [
        "选 3 个模式串手算 next 或 lps 数组",
        "用表格记录 KMP 每一步 i、j 的变化",
        "对比朴素匹配和 KMP 在重复模式串上的比较次数",
      ],
    },
    {
      id: "trees-binary-trees",
      order: 5,
      title: "树与二叉树",
      introduction:
        "树与二叉树用于表达层次关系，是递归思想、遍历算法、哈夫曼编码、二叉排序树和平衡结构的基础。",
      learningObjectives: [
        "理解树、二叉树和森林的基本概念",
        "掌握二叉树的先序、中序、后序和层次遍历",
        "能够应用二叉树性质解决结点数和高度问题",
      ],
      coreConcepts: [
        concept("tree", "树", "由 n 个结点组成的有限集合，具有唯一根结点和若干互不相交的子树。", [
          "根",
          "子树",
          "层次",
        ]),
        concept("binary-tree", "二叉树", "每个结点最多有两个子树，左右子树有严格次序。", [
          "二叉树",
          "左子树",
          "右子树",
        ]),
        concept("traversal", "二叉树遍历", "按某种规则访问所有结点，常见有先序、中序、后序和层次遍历。", [
          "先序",
          "中序",
          "后序",
          "层次遍历",
        ]),
        concept("complete-binary-tree", "完全二叉树", "除最后一层外均满，最后一层结点从左到右连续排列。", [
          "完全二叉树",
          "堆",
          "顺序存储",
        ]),
        concept("huffman-tree", "哈夫曼树", "带权路径长度最小的二叉树，常用于最优编码。", [
          "哈夫曼树",
          "WPL",
          "哈夫曼编码",
        ]),
      ],
      keyDifficulties: [
        "由遍历序列还原二叉树时要正确划分左右子树",
        "递归遍历和非递归遍历之间的栈模拟关系",
        "完全二叉树顺序编号性质与普通二叉树的差别",
      ],
      commonMistakes: [
        "认为二叉树每个结点必须有两个孩子",
        "混淆满二叉树、完全二叉树和平衡二叉树",
        "用前序和后序序列唯一确定普通二叉树",
      ],
      questionTypes: [
        "根据先序和中序序列重建二叉树",
        "计算二叉树高度、叶子数和度为 2 的结点数",
        "构造哈夫曼树并计算编码长度",
      ],
      codeExamples: [
        {
          id: "inorder-traversal",
          title: "二叉树中序遍历",
          language: "TypeScript",
          description: "递归访问左子树、根结点、右子树。",
          code: `type TreeNode<T> = {
  value: T;
  left: TreeNode<T> | null;
  right: TreeNode<T> | null;
};

function inorder<T>(root: TreeNode<T> | null, result: T[] = []) {
  if (!root) return result;
  inorder(root.left, result);
  result.push(root.value);
  inorder(root.right, result);
  return result;
}`,
          highlights: [
            "中序遍历顺序是左、根、右",
            "递归终止条件是空结点",
          ],
        },
      ],
      reviewSuggestions: [
        "把四种遍历都写成递归和非递归版本",
        "练习由先序+中序、后序+中序还原二叉树",
        "整理满二叉树、完全二叉树、哈夫曼树的性质对比",
      ],
    },
    {
      id: "graphs",
      order: 6,
      title: "图",
      introduction:
        "图用于描述多对多关系，重点学习邻接矩阵、邻接表、遍历、最小生成树、最短路径和拓扑排序。",
      learningObjectives: [
        "理解有向图、无向图、网和连通性的概念",
        "掌握邻接矩阵和邻接表的存储特点",
        "能够应用 DFS、BFS、最短路径和生成树算法",
      ],
      coreConcepts: [
        concept("graph", "图", "由顶点集合和边集合组成，可描述对象之间的复杂关系。", [
          "顶点",
          "边",
          "有向图",
          "无向图",
        ]),
        concept("adjacency-matrix", "邻接矩阵", "用二维数组表示顶点之间是否相邻，适合稠密图。", [
          "矩阵",
          "稠密图",
          "边权",
        ]),
        concept("adjacency-list", "邻接表", "为每个顶点维护相邻顶点列表，适合稀疏图。", [
          "链表",
          "稀疏图",
          "出边",
        ]),
        concept("graph-traversal", "图遍历", "从某个顶点出发访问所有可达顶点，常见 DFS 和 BFS。", [
          "DFS",
          "BFS",
          "visited",
        ]),
        concept("shortest-path", "最短路径", "在带权图中寻找路径权值和最小的路径。", [
          "Dijkstra",
          "Floyd",
          "权值",
        ]),
      ],
      keyDifficulties: [
        "DFS 与 BFS 的访问顺序受存储结构和邻接顺序影响",
        "最小生成树和最短路径解决的问题不同",
        "有向无环图拓扑排序要正确维护入度",
      ],
      commonMistakes: [
        "遍历图时忘记 visited 导致重复访问或死循环",
        "把最小生成树算法用于有向图最短路径问题",
        "Dijkstra 算法直接处理负权边",
      ],
      questionTypes: [
        "根据邻接表写出 DFS 或 BFS 序列",
        "用 Prim 或 Kruskal 构造最小生成树",
        "求单源最短路径或拓扑排序序列",
      ],
      codeExamples: [
        {
          id: "bfs-graph",
          title: "图的广度优先遍历",
          language: "TypeScript",
          description: "使用队列按层访问邻接表中的顶点。",
          code: `function bfs(graph: number[][], start: number) {
  const visited = new Set<number>([start]);
  const queue = [start];
  const order: number[] = [];
  while (queue.length > 0) {
    const vertex = queue.shift()!;
    order.push(vertex);
    for (const next of graph[vertex]) {
      if (!visited.has(next)) {
        visited.add(next);
        queue.push(next);
      }
    }
  }
  return order;
}`,
          highlights: [
            "队列保证按距离层次扩展",
            "入队时标记 visited 可避免重复入队",
          ],
        },
      ],
      reviewSuggestions: [
        "用同一张图分别画 DFS 树和 BFS 树",
        "对比邻接矩阵和邻接表在空间与遍历复杂度上的差异",
        "整理 Prim、Kruskal、Dijkstra、Floyd 的适用场景",
      ],
    },
    {
      id: "searching",
      order: 7,
      title: "查找",
      introduction:
        "查找研究在数据集合中定位目标元素的方法，涵盖顺序查找、折半查找、二叉排序树、平衡树和散列表。",
      learningObjectives: [
        "掌握顺序查找和折半查找的条件与复杂度",
        "理解二叉排序树的查找、插入和删除过程",
        "能够设计散列函数并处理冲突",
      ],
      coreConcepts: [
        concept("sequential-search", "顺序查找", "从表的一端开始逐个比较，适用于顺序表和链表。", [
          "线性查找",
          "平均查找长度",
          "哨兵",
        ]),
        concept("binary-search", "折半查找", "在有序顺序表中不断缩小查找区间。", [
          "二分查找",
          "有序表",
          "mid",
        ]),
        concept("bst", "二叉排序树", "左子树关键字小于根，右子树关键字大于根，支持动态查找。", [
          "BST",
          "中序有序",
          "动态查找",
        ]),
        concept("balanced-tree", "平衡二叉树", "通过旋转控制高度，避免二叉排序树退化。", [
          "AVL",
          "旋转",
          "平衡因子",
        ]),
        concept("hash-table", "散列表", "通过散列函数把关键字映射到存储位置，平均查找效率高。", [
          "哈希表",
          "散列函数",
          "冲突处理",
        ]),
      ],
      keyDifficulties: [
        "折半查找必须建立在有序顺序存储基础上",
        "二叉排序树删除结点时后继或前驱替换过程复杂",
        "散列冲突处理会影响查找成功和失败的平均长度",
      ],
      commonMistakes: [
        "在无序表或链表上直接使用折半查找",
        "二分查找边界更新导致死循环",
        "忽略装填因子对散列表性能的影响",
      ],
      questionTypes: [
        "手算折半查找比较次数和平均查找长度",
        "构造二叉排序树并执行删除操作",
        "设计散列函数并分析冲突处理过程",
      ],
      codeExamples: [
        {
          id: "binary-search",
          title: "折半查找",
          language: "TypeScript",
          description: "在升序数组中查找目标元素下标。",
          code: `function binarySearch(values: number[], target: number) {
  let left = 0;
  let right = values.length - 1;
  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2);
    if (values[mid] === target) return mid;
    if (values[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}`,
          highlights: [
            "循环条件是 left <= right",
            "用 right - left 避免 mid 计算溢出",
          ],
        },
      ],
      reviewSuggestions: [
        "把二分查找写成闭区间和左闭右开两种模板",
        "手动画二叉排序树插入和删除过程",
        "整理开放定址法与链地址法处理冲突的区别",
      ],
    },
    {
      id: "sorting",
      order: 8,
      title: "排序",
      introduction:
        "排序研究如何按关键字重新排列数据元素，重点比较插入、交换、选择、归并、基数等排序算法的思想、复杂度和稳定性。",
      learningObjectives: [
        "掌握常见内部排序算法的基本过程",
        "能够比较排序算法的时间复杂度、空间复杂度和稳定性",
        "理解不同数据规模和有序程度下排序算法的选择",
      ],
      coreConcepts: [
        concept("insertion-sort", "插入排序", "每次将一个待排序元素插入到已排序子序列的合适位置。", [
          "直接插入排序",
          "希尔排序",
          "稳定性",
        ]),
        concept("exchange-sort", "交换排序", "通过元素交换逐步达到有序，代表算法包括冒泡排序和快速排序。", [
          "冒泡排序",
          "快速排序",
          "划分",
        ]),
        concept("selection-sort", "选择排序", "每趟选择最小或最大元素放到最终位置。", [
          "简单选择排序",
          "堆排序",
          "堆",
        ]),
        concept("merge-sort", "归并排序", "采用分治思想，将有序子序列合并成更大的有序序列。", [
          "分治",
          "归并",
          "外部排序",
        ]),
        concept("radix-sort", "基数排序", "按关键字的各位进行分配和收集，适合特定位数的整数或字符串。", [
          "桶",
          "分配",
          "收集",
        ]),
      ],
      keyDifficulties: [
        "快速排序划分过程和递归边界容易写错",
        "稳定性判断要看相等关键字的相对顺序是否改变",
        "不同排序算法在最好、平均、最坏情况下复杂度不同",
      ],
      commonMistakes: [
        "认为所有 O(n log n) 排序都稳定",
        "快速排序选轴不当导致退化却仍按平均复杂度分析",
        "混淆堆排序建堆过程和选择排序过程",
      ],
      questionTypes: [
        "给定序列写出某趟排序后的结果",
        "比较排序算法的复杂度和稳定性",
        "实现快速排序、归并排序或堆排序",
      ],
      codeExamples: [
        {
          id: "quick-sort",
          title: "快速排序",
          language: "TypeScript",
          description: "通过划分把小于轴的元素放左侧，大于轴的元素放右侧。",
          code: `function quickSort(values: number[]): number[] {
  if (values.length <= 1) return values;
  const pivot = values[0];
  const left = values.slice(1).filter((value) => value < pivot);
  const right = values.slice(1).filter((value) => value >= pivot);
  return [...quickSort(left), pivot, ...quickSort(right)];
}`,
          highlights: [
            "核心思想是划分和递归",
            "教学版本清晰，但会创建额外数组",
          ],
        },
      ],
      reviewSuggestions: [
        "整理排序算法复杂度、空间复杂度和稳定性对比表",
        "手写 3 轮快速排序划分过程并标出轴位置",
        "用小规模数组逐步模拟插入、选择、归并和堆排序",
      ],
    },
  ],
};

function concept(
  id: string,
  title: string,
  summary: string,
  keywords: string[],
) {
  return {
    id,
    title,
    summary,
    keywords,
  };
}

export function getDataStructureChapters() {
  return dataStructureKnowledgeBase.chapters;
}

export function getDataStructureChapter(chapterId: string) {
  return dataStructureKnowledgeBase.chapters.find((chapter) => chapter.id === chapterId) ?? null;
}

export function searchDataStructureConcepts(keyword: string): ConceptSearchResult[] {
  const query = keyword.trim().toLowerCase();

  if (!query) {
    return [];
  }

  const results: ConceptSearchResult[] = [];

  for (const chapter of dataStructureKnowledgeBase.chapters) {
    for (const concept of chapter.coreConcepts) {
      const searchableText = [
        chapter.title,
        concept.title,
        concept.summary,
        ...concept.keywords,
      ]
        .join(" ")
        .toLowerCase();

      if (searchableText.includes(query)) {
        results.push({
          course: {
            id: dataStructureKnowledgeBase.id,
            title: dataStructureKnowledgeBase.title,
          },
          chapter: pickChapterSummary(chapter),
          concept,
        });
      }
    }
  }

  return results;
}

function pickChapterSummary(chapter: CourseChapter) {
  return {
    id: chapter.id,
    order: chapter.order,
    title: chapter.title,
  };
}
