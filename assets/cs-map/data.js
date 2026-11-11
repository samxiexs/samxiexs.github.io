/* A navigational taxonomy, not an exhaustive partition of computer science.
   Broad coverage follows CS2023; the nesting and cross-links are editorial. */
(() => {
  const n = (id, label, zh, kind, summary, examples, children = [], related = []) => ({ id, label, zh, kind, summary, examples, children, related });
  const root = n('cs', 'Computer Science', '计算机科学', 'Discipline',
    'The study of computation: what can be computed, how to build computing systems, and how people use them. This map groups overlapping ideas into eight starting points.',
    ['Start with a field, follow a branch, then explore the links between fields.'], [
    n('foundations', 'Theory & Foundations', '理论与数学基础', 'Area', 'Reason about the power, limits, and efficiency of computation. Mathematics supplies the language for proofs, uncertainty, and optimization.', ['What can be computed? How much time, space, or data does it take?'], [
      n('algorithms', 'Algorithms & Data Structures', '算法与数据结构', 'Field', 'Design procedures and organize data so that problems can be solved efficiently.', ['Graphs, sorting, dynamic programming, approximation algorithms.'], [], ['complexity', 'databases']),
      n('complexity', 'Computability & Complexity', '可计算性与计算复杂性', 'Field', 'Study which problems are solvable and the resources required to solve them.', ['Turing machines, undecidability, P versus NP, reductions.'], [], ['algorithms', 'crypto']),
      n('math', 'Discrete Math & Logic', '离散数学与逻辑', 'Foundation', 'Use formal structures and precise reasoning to describe computation.', ['Graphs, combinatorics, logic, proof techniques.'], [], ['verification']),
      n('probability', 'Probability & Statistics', '概率与统计', 'Foundation', 'Model uncertainty, learn from observations, and quantify what the evidence supports.', ['Random variables, estimation, hypothesis testing, uncertainty.'], [], ['ml', 'causal']),
      n('optimization', 'Optimization & Numerics', '优化与数值计算', 'Foundation', 'Find good solutions and compute with finite precision.', ['Gradient methods, convex optimization, numerical linear algebra.'], [], ['deep-learning', 'simulation'])
    ]),
    n('systems', 'Computer Systems', '计算机系统', 'Area', 'Build the hardware and software layers that execute programs, move data, and coordinate machines.', ['How do programs share a machine? How do services survive failures?'], [
      n('architecture', 'Computer Architecture', '计算机体系结构', 'Field', 'Organize processors, memory, and accelerators to execute workloads.', ['Instruction sets, caches, pipelines, GPUs.'], [], ['os', 'ml-systems']),
      n('os', 'Operating Systems', '操作系统', 'Field', 'Manage hardware resources and provide abstractions for running programs.', ['Processes, scheduling, virtual memory, file systems.'], [], ['architecture', 'systems-security']),
      n('networks', 'Computer Networks', '计算机网络', 'Field', 'Exchange information across connected devices using protocols and layered abstractions.', ['Routing, TCP/IP, congestion control, network measurement.'], [], ['distributed', 'systems-security']),
      n('distributed', 'Distributed Systems', '分布式系统', 'Field', 'Coordinate multiple machines despite failures, concurrency, and communication delays.', ['Consensus, replication, consistency, fault tolerance.'], [], ['databases', 'networks', 'ml-systems']),
      n('parallel', 'Parallel & High-Performance Computing', '并行与高性能计算 HPC', 'Field', 'Split work across processors to improve throughput or reduce time to solution.', ['Parallel algorithms, synchronization, GPU kernels.'], [], ['simulation', 'ml-systems']),
      n('embedded', 'Embedded & Real-Time Systems', '嵌入式与实时系统', 'Field', 'Compute within physical devices under timing, power, and resource constraints.', ['Sensors, control loops, microcontrollers, deadlines.'], [], ['robotics'])
    ]),
    n('software', 'Software & Languages', '软件与编程语言', 'Area', 'Express computations and engineer software that is correct, maintainable, and useful.', ['How can we make complex software easier to understand and trust?'], [
      n('pl', 'Programming Languages', '编程语言', 'Field', 'Study language design, semantics, and abstractions for expressing computation.', ['Type systems, functional programming, concurrency models.'], [], ['compilers', 'verification']),
      n('compilers', 'Compilers & Runtimes', '编译器与运行时', 'Field', 'Translate and execute programs while preserving meaning and improving efficiency.', ['Parsing, intermediate representations, optimization, garbage collection.'], [], ['architecture', 'ml-systems']),
      n('engineering', 'Software Engineering', '软件工程', 'Field', 'Design, build, test, and evolve software with people and organizations.', ['Requirements, architecture, testing, maintenance, version control.'], [], ['hci', 'systems-security']),
      n('verification', 'Formal Methods', '形式化方法', 'Field', 'Specify and check desired properties of software or hardware mathematically.', ['Model checking, theorem proving, program analysis.'], [], ['math', 'distributed']),
      n('platforms', 'Web & Mobile Development', 'Web 与移动开发', 'Practice', 'Build applications for browser and mobile platforms.', ['Client–server design, interfaces, accessibility, deployment.'], [], ['networks', 'interaction'])
    ]),
    n('data', 'Data & Information', '数据与信息', 'Area', 'Store, retrieve, organize, and extract knowledge from information at scale.', ['How do we find the right information, and how do we know its quality?'], [
      n('databases', 'Database Systems', '数据库系统', 'Field', 'Manage persistent data with useful query and consistency guarantees.', ['Relational models, SQL, indexes, transactions, query optimization.'], [], ['distributed', 'algorithms']),
      n('retrieval', 'Information Retrieval', '信息检索 IR', 'Field', 'Find and rank information relevant to an information need.', ['Search engines, ranking, sparse and dense retrieval, evaluation.'], [], ['nlp', 'rag']),
      n('mining', 'Data Mining & Analytics', '数据挖掘与分析', 'Field', 'Discover useful patterns and summarize structured or unstructured data.', ['Clustering, pattern discovery, anomaly detection.'], [], ['ml', 'visualization']),
      n('data-engineering', 'Data Engineering', '数据工程', 'Practice', 'Build reliable pipelines that collect, transform, and serve data.', ['ETL, streams, lineage, data quality.'], [], ['databases', 'ml-systems']),
      n('recommendation', 'Recommender Systems', '推荐系统', 'Field', 'Match users with items under relevance, feedback, and exposure constraints.', ['Collaborative filtering, retrieval and ranking, online experiments.'], [], ['ml', 'retrieval', 'causal'])
    ]),
    n('ai', 'Artificial Intelligence', '人工智能 AI', 'Area', 'Build systems that perceive, learn, reason, and act. Learning methods, application fields, and model architectures are related but different levels of this map.', ['What should an agent infer, learn, or do next?'], [
      n('ml', 'Machine Learning', '机器学习 ML', 'Field', 'Learn predictive or decision rules from data rather than specifying every rule by hand.', ['Supervised, unsupervised, and self-supervised learning are learning settings.'], [
        n('statistical-learning', 'Statistical Learning', '统计学习', 'Methods', 'Study generalization and learn functions from finite samples.', ['Linear models, trees, kernels, regularization, generalization bounds.'], [], ['probability']),
        n('deep-learning', 'Deep Learning', '深度学习 DL', 'Methods', 'Learn representations with multilayer neural networks. Architectures can be reused across many application fields.', ['Representation learning, backpropagation, pretraining.'], [
          n('cnn', 'Convolutional Networks', '卷积神经网络 CNN', 'Architecture', 'Use local connectivity and shared filters to model structured signals.', ['Image features, audio processing, translation-equivariant representations.'], [], ['cv']),
          n('rnn', 'Recurrent Networks', '循环神经网络 RNN LSTM', 'Architecture', 'Process sequences through a state updated over time.', ['RNNs, LSTMs, sequence modeling.'], [], ['nlp', 'speech']),
          n('transformer', 'Transformer', '注意力架构', 'Architecture', 'An attention-based neural architecture, originally introduced for sequence transduction. It is an architecture used across fields, not a peer field of NLP or computer vision.', ['Self-attention, positional information, encoder/decoder designs.'], [], ['attention', 'nlp', 'cv', 'multimodal', 'llm']),
          n('gnn', 'Graph Neural Networks', '图神经网络 GNN', 'Architecture', 'Learn representations from graph structure and node or edge features.', ['Message passing, molecular graphs, relational data.'], [], ['science-ai', 'recommendation'])
        ]),
        n('rl', 'Reinforcement Learning', '强化学习 RL', 'Learning setting', 'Learn behavior from interaction to maximize a cumulative reward.', ['Policies, value functions, exploration, offline RL.'], [], ['robotics', 'agents']),
        n('generative', 'Generative Modeling', '生成式建模', 'Methods', 'Model a data distribution to generate samples or reason about latent structure.', ['Autoregressive models, diffusion models, VAEs, GANs.'], [], ['llm', 'cv']),
        n('causal', 'Causal Inference', '因果推断', 'Cross-cutting field', 'Study effects of interventions under explicit assumptions. Prediction alone does not identify a causal effect.', ['Randomized experiments, causal graphs, identification, treatment effects.'], [], ['probability', 'recommendation', 'human-ai'])
      ]),
      n('cv', 'Computer Vision (CV)', '计算机视觉', 'Field', 'Interpret images and videos, including visual structure, objects, and motion.', ['Classification, detection, segmentation, 3D perception.'], [], ['cnn', 'transformer', 'graphics']),
      n('nlp', 'Natural Language Processing (NLP)', '自然语言处理', 'Field', 'Represent, analyze, and generate human language.', ['Language modeling, translation, information extraction, dialogue.'], [
        n('llm', 'Large Language Models', '大语言模型 LLM', 'Model family', 'Large-scale language models trained on text or mixed modalities. Many use Transformer architectures; model size and architecture are separate choices.', ['Pretraining, instruction tuning, evaluation.'], [], ['transformer', 'rag', 'responsible']),
        n('rag', 'Retrieval-Augmented Generation', '检索增强生成 RAG', 'Technique', 'Condition a generator on retrieved information. Retrieval quality and faithfulness must be evaluated separately.', ['Document indexing, retrieval, grounded answering.'], [], ['retrieval', 'llm'])
      ], ['transformer', 'retrieval']),
      n('speech', 'Speech & Audio', '语音与音频', 'Field', 'Understand and generate acoustic signals.', ['Speech recognition, speech synthesis, speaker and sound analysis.'], [], ['nlp', 'multimodal']),
      n('multimodal', 'Multimodal Learning', '多模态学习', 'Field', 'Learn from and align multiple kinds of signals.', ['Image–text alignment, audio–visual learning, cross-modal generation.'], [], ['cv', 'nlp', 'speech', 'transformer']),
      n('reasoning', 'Reasoning & Planning', '推理与规划', 'Field', 'Represent knowledge and search for conclusions or sequences of actions.', ['Knowledge representation, heuristic search, planning, constraint solving.'], [], ['math', 'agents']),
      n('agents', 'Agents & Robotics', '智能体与机器人', 'Field', 'Build systems that choose actions in digital or physical environments.', ['Tool use, perception–action loops, planning under uncertainty.'], [
        n('robotics', 'Robotics', '机器人学', 'Field', 'Integrate perception, planning, and control to act in the physical world.', ['Localization, manipulation, motion planning.'], [], ['embedded', 'cv', 'rl'])
      ], ['reasoning', 'rl']),
      n('ml-systems', 'ML Systems', '机器学习系统 MLOps', 'Cross-cutting field', 'Make training and inference efficient, scalable, reproducible, and reliable.', ['Distributed training, serving, monitoring, accelerator utilization.'], [], ['distributed', 'architecture', 'compilers', 'data-engineering']),
      n('attention', 'Attention', '注意力机制', 'Mechanism', 'Compute context-dependent weighted combinations of representations. Attention is a building block used within and beyond Transformers.', ['Queries, keys, values; self-attention and cross-attention.'], [], ['transformer', 'multimodal']),
      n('science-ai', 'AI for Science', '科学智能', 'Application area', 'Use AI to support scientific modeling and discovery, with domain constraints and empirical validation.', ['Molecular modeling, surrogate models, experimental design.'], [], ['simulation', 'gnn', 'optimization'])
    ]),
    n('graphics', 'Graphics & Visualization', '图形学与可视化', 'Area', 'Create visual representations of worlds, simulations, and data. Graphics often synthesizes images; vision often interprets them.', ['How can a model or a dataset become an informative image?'], [
      n('rendering', 'Computer Graphics', '计算机图形学', 'Field', 'Represent geometry, light, and motion to synthesize images.', ['Rendering, geometry processing, animation.'], [], ['cv', 'simulation']),
      n('visualization', 'Data Visualization', '数据可视化', 'Field', 'Encode data visually to support exploration, explanation, and judgment.', ['Visual encodings, interactive analysis, uncertainty displays.'], [], ['hci', 'mining']),
      n('simulation', 'Scientific Computing', '科学计算与仿真', 'Field', 'Use computation to model and solve scientific or engineering problems.', ['Physical simulation, numerical solvers, computational experiments.'], [], ['optimization', 'parallel', 'science-ai']),
      n('xr', 'VR & AR', '虚拟现实与增强现实', 'Field', 'Build interactive experiences that connect digital and physical spaces.', ['Tracking, rendering, spatial interaction.'], [], ['interaction', 'cv'])
    ]),
    n('hci', 'People & Computing', '人机交互与社会计算', 'Area', 'Study how computing affects people and how to design systems around human needs and contexts.', ['Who does a system serve, and how do we evaluate its effects?'], [
      n('interaction', 'Human–Computer Interaction', '人机交互 HCI', 'Field', 'Design and evaluate interactive systems with people.', ['Interaction design, usability studies, participatory design.'], [], ['visualization', 'engineering']),
      n('human-ai', 'Human–AI Interaction', '人智交互 HAI', 'Field', 'Study human collaboration, reliance, and control around AI systems.', ['Decision support, explanations, calibrated trust, user studies.'], [], ['responsible', 'causal']),
      n('accessibility', 'Accessibility', '无障碍与辅助技术', 'Cross-cutting field', 'Make computing usable across abilities, devices, and contexts.', ['Assistive technology, keyboard access, inclusive evaluation.'], [], ['interaction', 'platforms']),
      n('social', 'Social Computing', '社会计算', 'Field', 'Study and build systems that mediate social behavior and collective activity.', ['Online communities, collaboration, platform governance.'], [], ['recommendation', 'privacy']),
      n('responsible', 'Ethics & Responsible Computing', '伦理与负责任计算', 'Cross-cutting field', 'Examine values, harms, accountability, and social consequences throughout system design and use.', ['Fairness, transparency, governance, environmental impacts.'], [], ['human-ai', 'privacy', 'llm'])
    ]),
    n('security', 'Security & Privacy', '安全与隐私', 'Area', 'Protect systems and information against adversarial behavior and inappropriate use.', ['What is the threat model, and which guarantees actually hold?'], [
      n('crypto', 'Cryptography', '密码学', 'Field', 'Construct and analyze mechanisms for confidentiality, integrity, and authentication under formal assumptions.', ['Encryption, signatures, secure computation.'], [], ['complexity']),
      n('systems-security', 'Systems & Network Security', '系统与网络安全', 'Field', 'Understand vulnerabilities and defend software, hosts, and networks.', ['Isolation, access control, protocol security, secure development.'], [], ['os', 'networks', 'engineering']),
      n('privacy', 'Privacy Engineering', '隐私工程', 'Field', 'Limit unwanted disclosure and use of personal information.', ['Data minimization, differential privacy, threat modeling.'], [], ['crypto', 'responsible']),
      n('ai-security', 'AI Security', '人工智能安全', 'Cross-cutting field', 'Analyze threats to AI systems and risks from their deployment.', ['Adversarial inputs, data poisoning, prompt injection, model extraction.'], [], ['llm', 'systems-security'])
    ])
  ]);
  window.CS_MAP_DATA = root;
})();
