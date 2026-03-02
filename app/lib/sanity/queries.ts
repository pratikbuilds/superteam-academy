export const coursesQuery = `*[_type == "course"]{
  _id,
  "slug": slug.current,
  title,
  description,
  shortDescription,
  "thumbnail": thumbnail,
  trackId,
  difficulty,
  xpReward,
  prerequisiteSlug,
  isActive,
  tags,
  modules[]{
    id,
    title,
    description,
    lessons[]{
      _type,
      _key,
      id,
      title,
      duration,
      xp,
      body,
      videoUrl,
      prompt,
      starterCode,
      language,
      testCases[]{
        input,
        expectedOutput,
        label
      }
    }
  }
}`;

export const courseBySlugQuery = `*[_type == "course" && slug.current == $slug][0]{
  _id,
  "slug": slug.current,
  title,
  description,
  shortDescription,
  "thumbnail": thumbnail,
  trackId,
  difficulty,
  xpReward,
  prerequisiteSlug,
  isActive,
  tags,
  modules[]{
    id,
    title,
    description,
    lessons[]{
      _type,
      _key,
      id,
      title,
      duration,
      xp,
      body,
      videoUrl,
      prompt,
      starterCode,
      language,
      testCases[]{
        input,
        expectedOutput,
        label
      }
    }
  }
}`;
