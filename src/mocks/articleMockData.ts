// Mock data for articles when database connection is unavailable
export const mockArticles = [
  {
    id: '1',
    title: 'Understanding the Phases of the Moon and Their Spiritual Significance',
    slug: 'understanding-moon-phases-spiritual-significance',
    content: `<p>The moon has captivated humanity since the beginning of time. Its cyclical nature and luminous presence in the night sky have inspired countless myths, rituals, and spiritual practices across cultures.</p>
    <h2>The New Moon: Beginnings and Intentions</h2>
    <p>The new moon represents the start of a lunar cycle. This is the perfect time for setting intentions, planting seeds (both literal and metaphorical), and beginning new projects. Many spiritual practitioners use this time to create vision boards, write down goals, or perform rituals focused on manifestation.</p>
    <h2>The Waxing Moon: Growth and Action</h2>
    <p>As the moon grows from new to full, its energy supports growth, action, and building momentum. This is an excellent time to take concrete steps toward your goals, learn new skills, or build upon existing projects.</p>
    <h2>The Full Moon: Culmination and Illumination</h2>
    <p>The full moon represents the peak of lunar energy. It illuminates what might otherwise remain hidden, bringing clarity, awareness, and sometimes revelations. Many traditions include full moon ceremonies for celebrating accomplishments, releasing what no longer serves, and charging objects like crystals with lunar energy.</p>
    <h2>The Waning Moon: Release and Reflection</h2>
    <p>As the moon decreases in size, its energy supports letting go, reflection, and inner work. This is an ideal time for breaking bad habits, decluttering your space, or releasing negative emotions through journaling or meditation.</p>
    <p>By aligning your activities with the moon's natural rhythm, you can harness its energy to support your spiritual practice and personal growth journey.</p>`,
    excerpt: 'Explore how the different phases of the moon can enhance your spiritual practice and personal growth journey.',
    featured_image_url: 'https://images.pexels.com/photos/2670898/pexels-photo-2670898.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    published_at: '2025-05-15T10:30:00Z',
    author_name: 'Luna Moonshadow',
    category: 'Lunar Wisdom',
    tags: ['moon phases', 'lunar energy', 'spiritual practice'],
    is_premium: false,
    read_count: 856
  },
  {
    id: '2',
    title: 'The Ancient Art of Tarot: Beyond Divination',
    slug: 'ancient-art-tarot-beyond-divination',
    content: `<p>Tarot cards are often associated with fortune-telling, but their utility extends far beyond predicting the future. These powerful archetypal images offer a mirror to our unconscious mind and a tool for profound self-discovery.</p>
    <h2>The Origins of Tarot</h2>
    <p>Contrary to popular belief, tarot cards weren't originally created for divination. The earliest known tarot decks appeared in 15th century Italy as playing cards for games similar to bridge. It wasn't until the 18th century that they became widely used for mystical purposes.</p>
    <h2>Tarot as a Psychological Tool</h2>
    <p>Carl Jung, the renowned psychiatrist, recognized the value of tarot imagery in accessing the collective unconscious. The cards represent universal experiences and archetypal figures that resonate across cultural boundaries, helping us tap into deeper wisdom.</p>
    <h2>Creative Inspiration</h2>
    <p>Many artists, writers, and musicians use tarot as a creative prompt. The rich symbolism can trigger new ideas, help overcome creative blocks, or provide structure for storytelling.</p>
    <h2>Mindfulness Practice</h2>
    <p>Drawing a card mindfully each morning can serve as a contemplative practice, offering a focus for meditation or a perspective to consider throughout your day.</p>
    <p>Whether you believe in their divinatory power or not, tarot cards offer a valuable tool for self-reflection, creative exploration, and connecting with the wisdom that lies within.</p>`,
    excerpt: 'Discover how tarot cards can be used as tools for self-discovery, creativity, and mindfulness beyond their traditional divinatory role.',
    featured_image_url: 'https://images.pexels.com/photos/6477973/pexels-photo-6477973.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    published_at: '2025-05-12T14:15:00Z',
    author_name: 'Iris Wildwood',
    category: 'Divination',
    tags: ['tarot', 'self-discovery', 'divination tools'],
    is_premium: true,
    read_count: 1243
  },
  {
    id: '3',
    title: 'Crystal Healing: Science, Spirituality, and the Power of Intention',
    slug: 'crystal-healing-science-spirituality-intention',
    content: `<p>Crystal healing stands at the intersection of ancient spiritual practice and modern energy work. While scientific evidence for the efficacy of crystals remains limited, many practitioners report significant benefits from working with these natural formations.</p>
    <h2>The Scientific Perspective</h2>
    <p>From a scientific standpoint, crystals possess interesting properties. Their ordered molecular structure creates an electrical charge known as the piezoelectric effect, which is used in technologies like watches and computer components. However, current research doesn't support claims that these properties directly influence human health.</p>
    <h2>The Placebo Effect and Intention</h2>
    <p>The placebo effect is often cited to explain the perceived benefits of crystal healing. Far from invalidating the practice, this underscores the remarkable power of belief and intention. When we engage mindfully with crystals as focal points for our intentions, we activate our own innate healing abilities.</p>
    <h2>Common Crystals and Their Traditional Associations</h2>
    <p>Different crystals have been associated with various properties throughout history:</p>
    <ul>
      <li><strong>Clear Quartz</strong>: Amplification, clarity, and purification</li>
      <li><strong>Amethyst</strong>: Calming energy, spiritual connection, and intuition</li>
      <li><strong>Rose Quartz</strong>: Love, compassion, and emotional healing</li>
      <li><strong>Citrine</strong>: Abundance, confidence, and creative expression</li>
    </ul>
    <p>Whether you approach crystal work as a spiritual practice or a mindfulness tool, these beautiful formations from the earth can serve as powerful reminders of our intentions and the natural world's wonders.</p>`,
    excerpt: 'Explore the fascinating world of crystal healing from both scientific and spiritual perspectives, and learn how intention plays a crucial role.',
    featured_image_url: 'https://images.pexels.com/photos/965981/pexels-photo-965981.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    published_at: '2025-05-08T09:45:00Z',
    author_name: 'Jade Crystalwaters',
    category: 'Crystal Wisdom',
    tags: ['crystals', 'healing', 'energy work'],
    is_premium: false,
    read_count: 1876
  }
];

export const mockComments = [
  {
    id: '101',
    article_id: '1',
    user_id: 'user1',
    user_name: 'MoonChild88',
    user_avatar: 'https://randomuser.me/api/portraits/women/43.jpg',
    content: 'This article really helped me understand why I feel so energized during the full moon! I\'ve started planning my creative projects around the lunar calendar.',
    created_at: '2025-05-16T14:30:00Z',
    status: 'approved' as 'approved',
    likes_count: 12,
    parent_id: null,
    replies_count: 2
  },
  {
    id: '102',
    article_id: '1',
    user_id: 'user2',
    user_name: 'StarGazer',
    user_avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
    content: 'I\'ve been practicing moon rituals for years but never fully understood the significance of the waning phase. Thank you for the insights!',
    created_at: '2025-05-17T10:15:00Z',
    status: 'approved' as 'approved',
    likes_count: 8,
    parent_id: null,
    replies_count: 0
  },
  {
    id: '103',
    article_id: '1',
    user_id: 'user3',
    user_name: 'LunarWisdom',
    user_avatar: null,
    content: 'I\'d love to see a follow-up article about specific rituals for each moon phase!',
    created_at: '2025-05-18T16:45:00Z',
    status: 'approved' as 'approved',
    likes_count: 5,
    parent_id: null,
    replies_count: 1
  },
  {
    id: '104',
    article_id: '1',
    user_id: 'admin1',
    user_name: 'Luna Moonshadow',
    user_avatar: 'https://randomuser.me/api/portraits/women/84.jpg',
    content: 'Thank you for the suggestion! I\'m actually working on a series of articles about moon rituals. Stay tuned!',
    created_at: '2025-05-18T18:20:00Z',
    status: 'approved' as 'approved',
    likes_count: 3,
    parent_id: '103'
  },
  {
    id: '105',
    article_id: '1',
    user_id: 'user4',
    user_name: 'CosmicJourney',
    user_avatar: 'https://randomuser.me/api/portraits/women/32.jpg',
    content: 'I\'ve noticed that I sleep better during the new moon. Is there any scientific explanation for this?',
    created_at: '2025-05-19T21:10:00Z',
    status: 'approved' as 'approved',
    likes_count: 2,
    parent_id: '101'
  },
  {
    id: '106',
    article_id: '1',
    user_id: 'user5',
    user_name: 'NightSky',
    user_avatar: null,
    content: 'There are some studies suggesting that lunar cycles can influence sleep patterns, though research is still ongoing. Many people report similar experiences!',
    created_at: '2025-05-20T08:45:00Z',
    status: 'approved' as 'approved',
    likes_count: 4,
    parent_id: '101'
  }
];
