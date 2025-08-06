class TheInterviewCodeApp {
    constructor() {
        this.dsaQuestions = [];
        this.mlQuestions = [];
        this.dsaTopics = {};
        this.mlConcepts = {};
        this.filteredDSAQuestions = [];
        this.filteredMLQuestions = [];
        this.currentSection = 'home';
        this.currentQuestion = null;
        this.currentQuestionType = null;
        this.searchTerm = '';
        this.difficultyFilter = '';
        this.categoryFilter = '';
        this.topicFilter = '';
        this.dsaDisplayCount = 9;
        this.mlDisplayCount = 12;
        this.isLoading = false;

        const path = window.location.pathname;
        if (path.startsWith('/dsa/')) {
            const slug = path.split('/').pop();
            if (slug && slug !== 'dsa') {
                setTimeout(() => this.showQuestionBySlug(slug, 'dsa'), 200);
            } else {
                this.showSection('dsa');
            }
        } else if (path.startsWith('/ml/')) {
            const slug = path.split('/').pop();
            if (slug && slug !== 'ml') {
                setTimeout(() => this.showQuestionBySlug(slug, 'ml'), 200);
            } else {
                this.showSection('ml');
            }
        }

        this.init();
    }

    async init() {
        try {
            // Load all data first
            await this.loadData();
            
            // Initialize filtered questions
            this.filteredDSAQuestions = [...this.dsaQuestions];
            this.filteredMLQuestions = [...this.mlQuestions];
            
            // Setup event listeners first
            this.setupEventListeners();
            
            // Then handle routing and populate content
            this.populateFilters();
            this.handleInitialRoute();
            this.refreshCurrentSection();
            
            console.log('App initialized with:', {
                dsaQuestions: this.dsaQuestions.length,
                mlQuestions: this.mlQuestions.length
            });
        } catch (error) {
            console.error('Failed to initialize app:', error);
        }
    }

    async loadData() {
        // Load DSA Topics
        this.dsaTopics = {
            "Array": {
                "description": "Arrays are fundamental data structures that store elements of the same type in contiguous memory locations, allowing efficient access via indices.",
                "key_concepts": ["Indexing", "Traversal", "Sorting", "Searching", "Two Pointers", "Sliding Window"],
                "time_complexity": "Access: O(1), Search: O(n), Insertion/Deletion: O(n)",
                "example": "Finding the maximum element in an array requires traversing all elements once, giving O(n) time complexity.",
                "common_patterns": ["Two Sum", "Sliding Window", "Kadane's Algorithm", "Dutch National Flag"]
            },
            "String": {
                "description": "Strings are sequences of characters, often implemented as arrays of characters with special string manipulation functions.",
                "key_concepts": ["Pattern Matching", "Substring Search", "Palindromes", "Anagrams", "String Building"],
                "time_complexity": "Access: O(1), Search: O(n), Concatenation: O(n)",
                "example": "Checking if a string is a palindrome can be done in O(n) time using two pointers from both ends.",
                "common_patterns": ["KMP Algorithm", "Rabin-Karp", "Manacher's Algorithm", "Trie-based Solutions"]
            },
            "Linked List": {
                "description": "Linked Lists are linear data structures where elements are stored in nodes, each containing data and a reference to the next node.",
                "key_concepts": ["Traversal", "Insertion", "Deletion", "Reversal", "Cycle Detection", "Merging"],
                "time_complexity": "Access: O(n), Search: O(n), Insertion/Deletion: O(1) at known position",
                "example": "Detecting a cycle in a linked list using Floyd's algorithm (tortoise and hare) runs in O(n) time and O(1) space.",
                "common_patterns": ["Two Pointers", "Dummy Head", "Runner Technique", "Reversal"]
            },
            "Tree": {
                "description": "Trees are hierarchical data structures with nodes connected by edges, having one root and no cycles.",
                "key_concepts": ["Traversal (Inorder, Preorder, Postorder)", "Height", "Depth", "BST Operations", "Balancing"],
                "time_complexity": "Search/Insert/Delete: O(log n) for balanced trees, O(n) for skewed trees",
                "example": "Binary Search Tree allows efficient searching - at each node, go left if target is smaller, right if larger.",
                "common_patterns": ["DFS", "BFS", "Tree DP", "Path Sum", "Lowest Common Ancestor"]
            },
            "Graph": {
                "description": "Graphs consist of vertices connected by edges, representing relationships between entities. Can be directed or undirected.",
                "key_concepts": ["DFS", "BFS", "Shortest Path", "Cycle Detection", "Topological Sort", "Connected Components"],
                "time_complexity": "DFS/BFS: O(V + E), Dijkstra: O((V + E) log V), Floyd-Warshall: O(V³)",
                "example": "Finding shortest path in unweighted graph using BFS - explore all nodes at distance k before exploring nodes at distance k+1.",
                "common_patterns": ["Union Find", "Dijkstra's Algorithm", "Topological Sort", "Strongly Connected Components"]
            },
            "Dynamic Programming": {
                "description": "DP solves complex problems by breaking them into overlapping subproblems and storing results to avoid redundant calculations.",
                "key_concepts": ["Memoization", "Tabulation", "Optimal Substructure", "State Transition", "Base Cases"],
                "time_complexity": "Varies by problem, typically O(n²) or O(n³) for many classic problems",
                "example": "Fibonacci sequence: F(n) = F(n-1) + F(n-2). Store computed values to avoid recalculating same subproblems.",
                "common_patterns": ["1D DP", "2D DP", "Knapsack", "Longest Common Subsequence", "Edit Distance"]
            },
            "Stack": {
                "description": "Stack is a LIFO (Last In First Out) data structure that supports push and pop operations at one end called the top.",
                "key_concepts": ["Push", "Pop", "Peek", "Expression Evaluation", "Parentheses Matching", "Monotonic Stack"],
                "time_complexity": "Push/Pop/Peek: O(1), Search: O(n)",
                "example": "Validating balanced parentheses using a stack - push opening brackets, pop and match with closing brackets.",
                "common_patterns": ["Monotonic Stack", "Expression Parsing", "DFS Implementation", "Backtracking"]
            },
            "Heap": {
                "description": "Heap is a complete binary tree where parent nodes have higher (max-heap) or lower (min-heap) priority than children.",
                "key_concepts": ["Heapify", "Insert", "Extract", "Priority Queue", "Heap Sort"],
                "time_complexity": "Insert/Extract: O(log n), Build Heap: O(n), Peek: O(1)",
                "example": "Finding K largest elements in array using min-heap of size K - maintain heap with K smallest elements seen so far.",
                "common_patterns": ["Top K Problems", "Merge K Sorted Lists", "Median Finding", "Task Scheduling"]
            }
        };

        // Load DSA Questions from blind75_questions.json
        try {
            const dsaResp = await fetch('/blind75_questions.json');
            this.dsaQuestions = await dsaResp.json();
        } catch (err) {
            console.error('Failed to load DSA questions:', err);
            this.dsaQuestions = [];
        }

        // Load ML Questions from ml_100_questions.json
        try {
            const mlResp = await fetch('/ml_100_questions.json');
            const mlData = await mlResp.json();
            // Add slugs to ML questions if they don't have them
            this.mlQuestions = mlData.map(q => ({
                ...q,
                slug: q.slug || this.generateSlug(q.title)
            }));
        } catch (err) {
            console.error('Failed to load ML questions:', err);
            this.mlQuestions = [];
        }

        // Load ML Concepts
        this.mlConcepts = {
            "supervised_learning": {
                "title": "Supervised Learning",
                "description": "Learning with labeled data where the algorithm learns to map inputs to correct outputs.",
                "types": ["Classification", "Regression"],
                "examples": ["Email spam detection", "House price prediction", "Image recognition"],
                "algorithms": ["Linear Regression", "Logistic Regression", "Decision Trees", "Random Forest", "SVM", "Neural Networks"]
            },
            "unsupervised_learning": {
                "title": "Unsupervised Learning",
                "description": "Learning patterns from data without labeled examples.",
                "types": ["Clustering", "Dimensionality Reduction", "Association Rules"],
                "examples": ["Customer segmentation", "Anomaly detection", "Market basket analysis"],
                "algorithms": ["K-Means", "Hierarchical Clustering", "PCA", "t-SNE", "DBSCAN"]
            },
            "model_evaluation": {
                "title": "Model Evaluation",
                "description": "Methods to assess model performance and generalization ability. This includes not only metrics and validation techniques, but also understanding how well a model generalizes to unseen data, how to interpret results, and how to compare different models. Proper evaluation helps avoid overfitting, select the best model, and communicate results effectively.",
                "metrics": ["Accuracy", "Precision", "Recall", "F1-Score", "ROC-AUC", "RMSE", "MAE"],
                "techniques": ["Cross-Validation", "Train/Validation/Test Split", "Bootstrap", "Confusion Matrix"],
                "considerations": ["Overfitting", "Underfitting", "Bias-Variance Tradeoff"],
                "examples": [
                    "Using k-fold cross-validation to estimate model generalization.",
                    "Comparing models using ROC-AUC and F1-score for imbalanced datasets.",
                    "Analyzing confusion matrix to understand types of errors.",
                    "Reporting RMSE for regression tasks to quantify prediction error."
                ],
                "algorithms": [
                    "StratifiedKFold",
                    "GridSearchCV",
                    "RandomizedSearchCV"
                ]
            },
            "feature_engineering": {
                "title": "Feature Engineering",
                "description": "The process of selecting, modifying, or creating features from raw data to improve model performance.",
                "techniques": ["Feature Selection", "Feature Scaling", "Encoding Categorical Variables", "Creating Polynomial Features"],
                "examples": ["One-hot encoding", "Min-max scaling", "Principal Component Analysis", "Feature interaction"],
                "algorithms": ["StandardScaler", "MinMaxScaler", "SelectKBest", "PolynomialFeatures"]
            },
            "regularization": {
                "title": "Regularization",
                "description": "Techniques to prevent overfitting by adding a penalty for complexity to the loss function. Regularization helps models generalize better to unseen data.",
                "types": ["L1 (Lasso)", "L2 (Ridge)", "Elastic Net", "Dropout (for neural networks)"],
                "examples": ["Adding L2 penalty to linear regression", "Using dropout layers in deep learning"],
                "algorithms": ["Ridge Regression", "Lasso Regression", "ElasticNet", "Dropout"]
            },
            "ensemble_methods": {
                "title": "Ensemble Methods",
                "description": "Combining predictions from multiple models to improve accuracy and robustness. Ensembles reduce variance and bias.",
                "types": ["Bagging", "Boosting", "Stacking", "Voting"],
                "examples": ["Random Forest (bagging)", "AdaBoost (boosting)", "Gradient Boosting Machines"],
                "algorithms": ["Random Forest", "AdaBoost", "Gradient Boosting", "XGBoost", "LightGBM"]
            },
            "dimensionality_reduction": {
                "title": "Dimensionality Reduction",
                "description": "Techniques to reduce the number of input variables in a dataset, improving efficiency and reducing overfitting.",
                "types": ["Feature Selection", "Feature Extraction"],
                "examples": ["Principal Component Analysis (PCA)", "t-SNE for visualization"],
                "algorithms": ["PCA", "t-SNE", "LDA", "UMAP"]
            }
        };

        this.filteredDSAQuestions = [...this.dsaQuestions];
        this.filteredMLQuestions = [...this.mlQuestions];
    }

    handleInitialRoute() {
        const path = window.location.pathname;
        
        if (path.startsWith('/dsa/question/')) {
            const slug = path.split('/').pop();
            setTimeout(() => this.showQuestionBySlug(slug, 'dsa'), 200);
        } else if (path.startsWith('/ml/question/')) {
            const slug = path.split('/').pop();
            setTimeout(() => this.showQuestionBySlug(slug, 'ml'), 200);
        } else if (path.startsWith('/dsa')) {
            this.showSection('dsa');
        } else if (path.startsWith('/ml')) {
            this.showSection('ml');
        } else if (path.startsWith('/about')) {
            this.showSection('about');
        } else {
            this.showSection('home');
        }
    }

    updateUrl(path, title = '') {
        if (window.location.pathname !== path) {
            window.history.pushState({ path, title }, title, path);
            // Prevent the default navigation
            event.preventDefault();
        }
        if (title) {
            document.title = title + ' - TheInterviewCode';
        }
    }

    setupEventListeners() {
        // Brand/Logo navigation
        const brandTitle = document.querySelector('.brand-title');
        if (brandTitle) {
            brandTitle.style.cursor = 'pointer';
            brandTitle.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateToSection('home');
            });
        }

        // Handle all clicks through event delegation
        document.addEventListener('click', (e) => {
            // Find clicked elements
            const navLink = e.target.closest('[data-section]');
            const readMoreBtn = e.target.closest('.read-more');
            const questionCard = e.target.closest('.question-card');
            
            // Handle navigation links
            if (navLink && navLink.hasAttribute('data-section')) {
                e.preventDefault();
                const section = navLink.getAttribute('data-section');
                this.navigateToSection(section);
                return;
            }
            
            // Handle View Explanation/Solution clicks
            if (readMoreBtn && questionCard) {
                e.preventDefault();
                const slug = questionCard.dataset.questionSlug;
                const type = questionCard.dataset.questionType;
                if (!slug || !type) {
                    console.error('Missing question data:', { slug, type });
                    return;
                }
                this.showQuestionBySlug(slug, type);
                return;
            }

            // Handle question card clicks
            const card = e.target.closest('.question-card');
            const readMore = e.target.closest('.read-more');
            if (card && card.dataset.questionSlug && card.dataset.questionType && readMore) {
                e.preventDefault();
                e.stopPropagation();
                const slug = card.dataset.questionSlug;
                const type = card.dataset.questionType;
                this.navigateToQuestion(slug, type);
                return false; // Prevent any default navigation
            }

            // Handle related question card clicks
            const relatedCard = e.target.closest('.related-question-card');
            if (relatedCard && relatedCard.dataset.questionSlug && relatedCard.dataset.questionType) {
                e.preventDefault();
                e.stopPropagation();
                const slug = relatedCard.dataset.questionSlug;
                const type = relatedCard.dataset.questionType;
                this.navigateToQuestion(slug, type);
            }

            // Handle topic pill clicks
            const topicPill = e.target.closest('.topic-pill');
            if (topicPill) {
                e.preventDefault();
                document.querySelectorAll('.topic-pill').forEach(p => p.classList.remove('active'));
                topicPill.classList.add('active');
                
                if (topicPill.dataset.topic) {
                    this.categoryFilter = topicPill.dataset.topic;
                } else if (topicPill.dataset.category) {
                    this.categoryFilter = topicPill.dataset.category;
                }
                this.applyFilters();
            }
        });

        // Handle browser navigation
        window.addEventListener('popstate', (e) => {
            this.handleInitialRoute();
        });

        // Mobile menu toggle
        const navToggle = document.getElementById('navToggle');
        const navMenu = document.getElementById('navMenu');
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                navMenu.classList.toggle('active');
                navToggle.classList.toggle('active');
            });
        }

        // Search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.searchTerm = e.target.value.toLowerCase().trim();
                    this.applyFilters();
                }, 300);
            });
        }

        // Filter functionality
        const difficultyFilter = document.getElementById('difficultyFilter');
        const categoryFilter = document.getElementById('categoryFilter');
        
        if (difficultyFilter) {
            difficultyFilter.addEventListener('change', (e) => {
                this.difficultyFilter = e.target.value;
                this.applyFilters();
            });
        }

        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.categoryFilter = e.target.value;
                this.applyFilters();
            });
        }

        // Prevent all link navigation and handle through our router
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && link.href && link.href.startsWith(window.location.origin)) {
                e.preventDefault();
            }
        });

        // Social sharing and print
        this.setupSocialSharing();

        // Infinite scroll
        window.addEventListener('scroll', () => {
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 1000) {
                this.loadMoreQuestions();
            }
        });
    }

    setupSocialSharing() {
        document.addEventListener('click', (e) => {
            if (e.target.id === 'shareTwitter') {
                e.preventDefault();
                const url = encodeURIComponent(window.location.href);
                const text = encodeURIComponent(`Check out this solution: ${this.currentQuestion?.title || 'TechPrep Question'}`);
                window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
            }

            if (e.target.id === 'shareLinkedIn') {
                e.preventDefault();
                const url = encodeURIComponent(window.location.href);
                window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
            }

            if (e.target.id === 'copyLink') {
                e.preventDefault();
                navigator.clipboard.writeText(window.location.href).then(() => {
                    e.target.textContent = 'Copied!';
                    setTimeout(() => {
                        e.target.textContent = 'Copy Link';
                    }, 2000);
                }).catch(err => {
                    console.error('Failed to copy link:', err);
                });
            }

            if (e.target.id === 'printSolution') {
                e.preventDefault();
                window.print();
            }
        });
    }

    navigateToSection(sectionName) {
        const paths = {
            'home': '/',
            'dsa': '/dsa',
            'ml': '/ml',
            'about': '/about'
        };
        
        const path = paths[sectionName] || '/';
        const title = this.getSectionTitle(sectionName);
        
        this.updateUrl(path, title);
        this.showSection(sectionName);
    }

    navigateToQuestion(questionSlug, type, event) {
        if (event) {
            event.preventDefault();
        }
        const path = `/${type}/${questionSlug}`;
        const question = this.getQuestionBySlug(questionSlug, type);
        const title = question ? question.title : 'Question';
        
        // First show the question content
        this.showQuestionBySlug(questionSlug, type);
        
        // Then update the URL without causing a page reload
        window.history.pushState({ path, title }, title, path);
        document.title = title + ' - TechPrep';
        
        return false;
    }

    getSectionTitle(section) {
        const titles = {
            'home': 'TechPrep - DSA & ML Interview Questions',
            'dsa': 'Data Structures & Algorithms',
            'ml': 'Machine Learning Questions',
            'about': 'About TechPrep'
        };
        return titles[section] || 'TechPrep';
    }

    getQuestionBySlug(slug, type) {
        const questions = type === 'dsa' ? this.dsaQuestions : this.mlQuestions;
        return questions.find(q => q.slug === slug);
    }

    populateFilters() {
        const categoryFilter = document.getElementById('categoryFilter');
        
        if (categoryFilter) {
            let categories = [];
            if (this.currentSection === 'dsa') {
                // Only DSA categories (from question.category, not tags)
                categories = [...new Set(this.dsaQuestions.map(q => q.category).filter(Boolean))].sort();
            } else if (this.currentSection === 'ml') {
                // Only ML categories
                categories = [...new Set(this.mlQuestions.map(q => q.category).filter(Boolean))].sort();
            } else {
                categories = [];
            }

            categoryFilter.innerHTML = '<option value="">All Categories</option>';
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                categoryFilter.appendChild(option);
            });
        }
        // topicFilter dropdown is not populated anymore
    }

    showSection(sectionName) {
        // Update navigation
        document.querySelectorAll('.nav__link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === sectionName) {
                link.classList.add('active');
            }
        });

        // Handle visibility
        const breadcrumb = document.getElementById('breadcrumb');
        const searchSection = document.querySelector('.search-section');
        
        if (sectionName === 'solution') {
            if (breadcrumb) breadcrumb.classList.remove('hidden');
        } else {
            if (breadcrumb) breadcrumb.classList.add('hidden');
        }

        if (sectionName === 'home' || sectionName === 'about' || sectionName === 'solution') {
            if (searchSection) searchSection.style.display = 'none';
        } else {
            if (searchSection) searchSection.style.display = 'block';
        }

        // Show content section
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });

        const targetSection = document.getElementById(`${sectionName}Section`);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Show/hide filter dropdowns based on section
        const filterControls = document.querySelector('.filter-controls');
        const difficultyFilter = document.getElementById('difficultyFilter');
        const categoryFilter = document.getElementById('categoryFilter');
        const topicFilter = document.getElementById('topicFilter');
        this.currentSection = sectionName; // <-- Move this line BEFORE populateFilters

        if (filterControls) {
            if (sectionName === 'dsa' || sectionName === 'ml') {
                filterControls.style.display = 'flex';
                if (difficultyFilter) difficultyFilter.style.display = '';
                if (categoryFilter) categoryFilter.style.display = '';
                if (topicFilter) topicFilter.style.display = 'none';
                // Repopulate category dropdown for correct section
                this.populateFilters();
            } else {
                filterControls.style.display = 'none';
            }
        }

        if (sectionName !== 'solution') {
            this.resetFilters();
        }

        this.refreshCurrentSection();

        // Close mobile menu
        const navMenu = document.getElementById('navMenu');
        const navToggle = document.getElementById('navToggle');
        if (navMenu) navMenu.classList.remove('active');
        if (navToggle) navToggle.classList.remove('active');

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    showQuestionBySlug(questionSlug, type) {
        if (!questionSlug || !type) {
            console.error('Invalid question parameters:', { questionSlug, type });
            this.navigateToSection('home');
            return;
        }
        
        const questions = type === 'dsa' ? this.dsaQuestions : this.mlQuestions;
        if (!Array.isArray(questions) || questions.length === 0) {
            console.error(`No ${type} questions loaded`);
            this.navigateToSection('home');
            return;
        }

        const question = this.getQuestionBySlug(questionSlug, type);
        if (!question) {
            console.error(`Question not found: ${type}/${questionSlug}`);
            this.navigateToSection('home');
            return;
        }

        // Update state
        this.currentQuestion = question;
        this.currentQuestionType = type;
        
        // Update UI
        this.updateBreadcrumb(question, type);
        this.renderSolutionPage(question, type);
        this.showSection('solution');
        
        // Update URL without page reload
        const path = `/${type}/${questionSlug}`;
        const title = question.title;
        window.history.pushState({ path, title }, title, path);
        document.title = title + ' - TechPrep';
    }

    updateBreadcrumb(question, type) {
        const breadcrumbSection = document.getElementById('breadcrumbSection');
        const breadcrumbQuestion = document.getElementById('breadcrumbQuestion');
        
        if (breadcrumbSection) {
            const sectionName = type === 'dsa' ? 'DSA' : 'Machine Learning';
            breadcrumbSection.innerHTML = `<a href="/${type}" data-section="${type}">${sectionName}</a>`;
        }
        
        if (breadcrumbQuestion) {
            breadcrumbQuestion.textContent = question.title;
        }
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    renderSolutionPage(question, type) {
        if (!question) return;

        const titleEl = document.getElementById('solutionTitle');
        const metaEl = document.getElementById('solutionMeta');
        const readingTimeEl = document.getElementById('solutionReadingTime');
        const overviewEl = document.getElementById('solutionOverview');
        const problemEl = document.getElementById('solutionProblem');
        const explanationEl = document.getElementById('solutionExplanation');
        const codeEl = document.getElementById('solutionCode');
        const complexityEl = document.getElementById('solutionComplexity');

        if (titleEl) titleEl.textContent = question.title;

        if (metaEl && question.difficulty) {
            const difficultyClass = question.difficulty.toLowerCase();
            const tags = Array.isArray(question.tags) ? question.tags : [];
            metaEl.innerHTML = `
                <span class="difficulty-badge difficulty-badge--${difficultyClass}">${question.difficulty}</span>
                ${type === 'ml' && question.category ? `<span class="tag">${question.category}</span>` : ''}
                ${tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            `;
        }

        if (readingTimeEl) {
            const readingTime = this.estimateReadingTime(question, type);
            readingTimeEl.textContent = `📖 ${readingTime} min read`;
        }

        if (overviewEl) {
            overviewEl.innerHTML = `
                <h3>Overview</h3>
                <p>${type === 'dsa' ? question.solution : question.answer}</p>
            `;
        }

        if (problemEl) {
            problemEl.innerHTML = `
                <h3>${type === 'dsa' ? 'Problem Statement' : 'Question'}</h3>
                <p>${type === 'dsa' ? question.problem : question.question}</p>
            `;
        }

        if (explanationEl && question.explanation) {
            const explanation = typeof question.explanation === 'string' ? question.explanation : '';
            explanationEl.innerHTML = `
                <h3>Detailed Explanation</h3>
                <p>${explanation}</p>
            `;
        }

        if (codeEl && type === 'dsa' && question.code) {
            const code = typeof question.code === 'string' ? question.code : '';
            codeEl.innerHTML = `
                <h3>Code Implementation</h3>
                <div class="code-block">
                    <button class="copy-code-btn" onclick="window.theInterviewCodeApp.copyCode(this)">Copy</button>
                    <pre><code class="language-python">${this.escapeHtml(code)}</code></pre>
                </div>
            `;
        }

        if (complexityEl && type === 'dsa') {
            complexityEl.innerHTML = `
                <h3>Complexity Analysis</h3>
                <div class="complexity-grid">
                    <div class="complexity-item">
                        <h4>Time Complexity</h4>
                        <span>${question.timeComplexity || 'Not specified'}</span>
                    </div>
                    <div class="complexity-item">
                        <h4>Space Complexity</h4>
                        <span>${question.spaceComplexity || 'Not specified'}</span>
                    </div>
                </div>
            `;
        }

        this.renderRelatedQuestions(question, type);

        if (window.Prism) {
            setTimeout(() => window.Prism.highlightAll(), 100);
        }
    }

    renderRelatedQuestions(question, type) {
        const relatedQuestionsEl = document.getElementById('relatedQuestions');
        if (!relatedQuestionsEl || !question.relatedQuestions) return;

        const relatedQuestions = question.relatedQuestions
            .map(id => this.getQuestionById(id, type))
            .filter(Boolean)
            .slice(0, 3);

        if (relatedQuestions.length === 0) return;

        relatedQuestionsEl.innerHTML = `
            <div class="related-questions-grid">
                ${relatedQuestions.map(q => `
                    <div class="related-question-card" data-question-slug="${q.slug}" data-question-type="${type}">
                        <h4>${q.title}</h4>
                        <span class="difficulty-badge difficulty-badge--${q.difficulty.toLowerCase()}">${q.difficulty}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    getQuestionById(id, type) {
        const questions = type === 'dsa' ? this.dsaQuestions : this.mlQuestions;
        return questions.find(q => q.id === id);
    }

    estimateReadingTime(question, type) {
        const wordsPerMinute = 200;
        let wordCount = 0;

        if (type === 'dsa') {
            wordCount += (question.problem || '').split(' ').length;
            wordCount += (question.solution || '').split(' ').length;
            wordCount += (question.explanation || '').split(' ').length;
            wordCount += (question.code || '').split(' ').length * 0.5;
        } else {
            wordCount += (question.question || '').split(' ').length;
            wordCount += (question.answer || '').split(' ').length;
        }

        return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
    }

    copyCode(button) {
        const codeBlock = button.nextElementSibling.querySelector('code');
        if (codeBlock) {
            navigator.clipboard.writeText(codeBlock.textContent).then(() => {
                const originalText = button.textContent;
                button.textContent = 'Copied!';
                setTimeout(() => {
                    button.textContent = originalText;
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy code:', err);
            });
        }
    }

    resetFilters() {
        this.searchTerm = '';
        this.difficultyFilter = '';
        this.categoryFilter = '';
        this.topicFilter = '';
        
        const searchInput = document.getElementById('searchInput');
        const difficultyFilter = document.getElementById('difficultyFilter');
        const categoryFilter = document.getElementById('categoryFilter');
        const topicFilter = document.getElementById('topicFilter');
        
        if (searchInput) searchInput.value = '';
        if (difficultyFilter) difficultyFilter.value = '';
        if (categoryFilter) categoryFilter.value = '';
        if (topicFilter) topicFilter.value = ''; // topicFilter remains but is hidden
        
        this.dsaDisplayCount = 9;
        this.mlDisplayCount = 12;
        
        this.filteredDSAQuestions = [...this.dsaQuestions];
        this.filteredMLQuestions = [...this.mlQuestions];
    }

    refreshCurrentSection() {
        if (this.currentSection === 'dsa') {
            this.renderDSATopics();
            this.renderDSATopicNavigation();
            this.displayDSAQuestions();
        } else if (this.currentSection === 'ml') {
            this.renderMLConcepts();
            this.renderMLTopicNavigation();
            this.displayMLQuestions();
        } else if (this.currentSection === 'home') {
            this.displayFeaturedQuestions();
        }
    }

    renderDSATopics() {
        const topicsGrid = document.getElementById('dsaTopicsGrid');
        if (!topicsGrid) return;

        topicsGrid.innerHTML = Object.entries(this.dsaTopics).map(([topic, data]) => `
            <div class="topic-card">
                <h4>${topic}</h4>
                <p class="topic-description">${data.description}</p>
                <div class="topic-meta">
                    <span class="topic-meta-item">${data.time_complexity}</span>
                </div>
                <div class="concept-details">
                    <h5>Key Concepts:</h5>
                    <ul class="concept-list">
                        ${data.key_concepts.map(concept => `<li>${concept}</li>`).join('')}
                    </ul>
                    <h5>Common Patterns:</h5>
                    <ul class="concept-list">
                        ${data.common_patterns.map(pattern => `<li>${pattern}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `).join('');
    }

    renderDSATopicNavigation() {
        const topicPills = document.getElementById('dsaTopicPills');
        if (!topicPills) return;

        const topics = Object.keys(this.dsaTopics);
        topicPills.innerHTML = topics.map(topic => 
            `<span class="topic-pill" data-topic="${topic}">${topic}</span>`
        ).join('');
    }

    renderMLConcepts() {
        const conceptsGrid = document.getElementById('mlConceptsGrid');
        if (!conceptsGrid) return;

        conceptsGrid.innerHTML = Object.entries(this.mlConcepts).map(([key, concept]) => `
            <div class="concept-card">
                <h4>${concept.title}</h4>
                <p class="concept-description">${concept.description}</p>
                <div class="concept-details">
                    ${concept.types ? `
                        <h5>Types:</h5>
                        <ul class="concept-list">
                            ${concept.types.map(type => `<li>${type}</li>`).join('')}
                        </ul>
                    ` : ''}
                    ${concept.algorithms ? `
                        <h5>Algorithms:</h5>
                        <ul class="concept-list">
                            ${concept.algorithms.map(algo => `<li>${algo}</li>`).join('')}
                        </ul>
                    ` : ''}
                    ${concept.examples ? `
                        <h5>Examples:</h5>
                        <ul class="concept-list">
                            ${concept.examples.map(example => `<li>${example}</li>`).join('')}
                        </ul>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    renderMLTopicNavigation() {
        const topicPills = document.getElementById('mlTopicPills');
        if (!topicPills) return;

        // Defensive: filter out empty/null categories
        const categories = [...new Set(this.mlQuestions.map(q => q.category).filter(Boolean))];
        topicPills.innerHTML = categories.map(category => 
            `<span class="topic-pill" data-category="${category}">${category}</span>`
        ).join('');
    }

    applyFilters() {
        this.filteredDSAQuestions = this.dsaQuestions.filter(question => {
            const matchesSearch = this.searchTerm === '' || 
                question.title.toLowerCase().includes(this.searchTerm) ||
                question.problem.toLowerCase().includes(this.searchTerm) ||
                question.solution.toLowerCase().includes(this.searchTerm) ||
                question.tags.some(tag => tag.toLowerCase().includes(this.searchTerm));

            const matchesDifficulty = this.difficultyFilter === '' || question.difficulty === this.difficultyFilter;
            const matchesCategory = this.categoryFilter === '' || 
                question.tags.includes(this.categoryFilter) ||
                question.category === this.categoryFilter;

            return matchesSearch && matchesDifficulty && matchesCategory;
        });

        this.filteredMLQuestions = this.mlQuestions.filter(question => {
            const matchesSearch = this.searchTerm === '' || 
                (question.title && question.title.toLowerCase().includes(this.searchTerm)) ||
                (question.question && question.question.toLowerCase().includes(this.searchTerm)) ||
                (question.answer && question.answer.toLowerCase().includes(this.searchTerm)) ||
                (Array.isArray(question.tags) && question.tags.some(tag => tag.toLowerCase().includes(this.searchTerm)));

            const matchesDifficulty = this.difficultyFilter === '' || question.difficulty === this.difficultyFilter;
            // Defensive: category may be missing
            const matchesCategory = this.categoryFilter === '' || 
                (question.category && question.category === this.categoryFilter) ||
                (Array.isArray(question.tags) && question.tags.includes(this.categoryFilter));

            return matchesSearch && matchesDifficulty && matchesCategory;
        });

        this.dsaDisplayCount = 9;
        this.mlDisplayCount = 12;

        this.refreshCurrentSection();
    }

    displayFeaturedQuestions() {
        const featuredDSA = document.getElementById('featuredDSA');
        const featuredML = document.getElementById('featuredML');

        if (featuredDSA) {
            featuredDSA.innerHTML = '';
            if (this.dsaQuestions && this.dsaQuestions.length > 0) {
                this.dsaQuestions.slice(0, 3).forEach(question => {
                    const card = this.createQuestionCard(question, 'dsa');
                    featuredDSA.appendChild(card);
                });
            } else {
                featuredDSA.innerHTML = '<div class="no-results">Loading DSA questions...</div>';
            }
        }

        if (featuredML) {
            featuredML.innerHTML = '';
            if (this.mlQuestions && this.mlQuestions.length > 0) {
                this.mlQuestions.slice(0, 3).forEach(question => {
                    const card = this.createQuestionCard(question, 'ml');
                    featuredML.appendChild(card);
                });
            } else {
                featuredML.innerHTML = '<div class="no-results">Loading ML questions...</div>';
            }
        }
    }

    displayDSAQuestions() {
        const container = document.getElementById('dsaQuestions');
        if (!container) return;

        container.innerHTML = '';
        this.filteredDSAQuestions.slice(0, this.dsaDisplayCount).forEach(question => {
            container.appendChild(this.createQuestionCard(question, 'dsa'));
        });

        this.updateLoadingIndicator('dsa');
    }

    displayMLQuestions() {
        const container = document.getElementById('mlQuestions');
        if (!container) return;

        // Clear existing content
        container.innerHTML = '';
        
        // Display filtered questions
        if (this.filteredMLQuestions && this.filteredMLQuestions.length > 0) {
            this.filteredMLQuestions.slice(0, this.mlDisplayCount).forEach(question => {
                const card = this.createQuestionCard(question, 'ml');
                container.appendChild(card);
            });
        } else {
            container.innerHTML = '<div class="no-results">No questions found</div>';
        }

        this.updateLoadingIndicator('ml');
    }

    createQuestionCard(question, type) {
        if (!question || !question.title) {
            console.error('Invalid question:', question);
            return null;
        }

        // Ensure question has a slug
        if (!question.slug) {
            question.slug = this.generateSlug(question.title);
        }

        const card = document.createElement('div');
        card.className = 'question-card';
        card.dataset.questionSlug = question.slug;
        card.dataset.questionType = type;

        const difficultyClass = (question.difficulty || 'Easy').toLowerCase();
        // Defensive: Use question.question for ML, question.problem for DSA, fallback to title
        let content = '';
        if (type === 'dsa') {
            content = question.problem || question.title || '';
        } else {
            content = question.question || question.title || '';
        }
        const preview = content.length > 150 ? content.substring(0, 150) + '...' : content;

        // Defensive: tags may be missing or not an array
        const tags = Array.isArray(question.tags) ? question.tags : [];

        card.innerHTML = `
            <div class="question-card__header">
                <h3 class="question-card__title">${question.title}</h3>
                <span class="difficulty-badge difficulty-badge--${difficultyClass}">${question.difficulty || ''}</span>
            </div>
            <div class="question-card__content">
                <p class="question-card__problem">${preview}</p>
            </div>
            <div class="question-card__footer">
                ${tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                <span class="read-more">${type === 'dsa' ? 'View Solution' : 'View Explanation'} →</span>
            </div>
        `;

        return card;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    loadMoreQuestions() {
        if (this.isLoading) return;

        this.isLoading = true;
        
        if (this.currentSection === 'dsa' && this.dsaDisplayCount < this.filteredDSAQuestions.length) {
            this.dsaDisplayCount += 9;
            setTimeout(() => {
                this.displayDSAQuestions();
                this.isLoading = false;
            }, 500);
        } else if (this.currentSection === 'ml' && this.mlDisplayCount < this.filteredMLQuestions.length) {
            this.mlDisplayCount += 12;
            setTimeout(() => {
                this.displayMLQuestions();
                this.isLoading = false;
            }, 500);
        } else {
            this.isLoading = false;
        }
    }

    generateSlug(text) {
        return text
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '') // Remove all non-word chars
            .replace(/\s+/g, '-')          // Replace spaces with -
            .replace(/--+/g, '-')          // Replace multiple - with single -
            .replace(/^-+|-+$/g, '');      // Trim - from start and end
    }

    updateLoadingIndicator(type) {
        const loadingIndicator = document.getElementById(`${type}Loading`);
        if (!loadingIndicator) return;

        const displayCount = type === 'dsa' ? this.dsaDisplayCount : this.mlDisplayCount;
        const totalCount = type === 'dsa' ? this.filteredDSAQuestions.length : this.filteredMLQuestions.length;

        if (displayCount < totalCount) {
            loadingIndicator.classList.add('visible');
        } else {
            loadingIndicator.classList.remove('visible');
        }
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.theInterviewCodeApp = new TheInterviewCodeApp();
});
