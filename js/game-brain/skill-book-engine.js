import {
  GAME_SKILLS,
  getSkillById,
  getHeroAvailableSkills
} from "../regras/skills.js";

export function ensureSkillBook(character) {
  character.skillBook = character.skillBook || {};

  character.skillBook.learned = character.skillBook.learned || [];
  character.skillBook.equipped = character.skillBook.equipped || [];

  if (Array.isArray(character.skills)) {
    character.skills.forEach(skill => {
      const id = typeof skill === "string" ? skill : skill?.id;
      if (id && !character.skillBook.learned.includes(id)) {
        character.skillBook.learned.push(id);
      }
    });
  }

  return character.skillBook;
}

export function getSkillSlots(character) {
  return 3 + Math.floor((character.level || 1) / 20);
}

export function getLearnedSkills(character) {
  const book = ensureSkillBook(character);

  return book.learned
    .map(id => getSkillById(id))
    .filter(Boolean);
}

export function getEquippedSkills(character) {
  const book = ensureSkillBook(character);

  return book.equipped
    .map(id => getSkillById(id))
    .filter(Boolean);
}

export function getAvailableSkillsToLearn(character) {
  const book = ensureSkillBook(character);
  const available = getHeroAvailableSkills(character);

  return available.filter(skill => !book.learned.includes(skill.id));
}

export function learnSkill(character, skillId) {
  const book = ensureSkillBook(character);
  const skill = getSkillById(skillId);

  if (!skill) {
    return { ok: false, message: "Skill não encontrada." };
  }

  if ((character.level || 1) < (skill.minLevel || 1)) {
    return {
      ok: false,
      message: `Essa skill exige nível ${skill.minLevel}.`
    };
  }

  if (skill.classId && skill.classId !== character.classId) {
    return {
      ok: false,
      message: "Essa skill não pertence à sua classe."
    };
  }

  if (!book.learned.includes(skillId)) {
    book.learned.push(skillId);
  }

  return {
    ok: true,
    message: `Skill aprendida: ${skill.name}.`,
    skill
  };
}

export function equipSkill(character, skillId) {
  const book = ensureSkillBook(character);
  const skill = getSkillById(skillId);

  if (!skill) {
    return { ok: false, message: "Skill não encontrada." };
  }

  if (!book.learned.includes(skillId)) {
    return { ok: false, message: "Você ainda não aprendeu essa skill." };
  }

  if (book.equipped.includes(skillId)) {
    return { ok: false, message: "Essa skill já está equipada." };
  }

  const maxSlots = getSkillSlots(character);

  if (book.equipped.length >= maxSlots) {
    return {
      ok: false,
      message: `Limite de ${maxSlots} skills equipadas.`
    };
  }

  book.equipped.push(skillId);

  return {
    ok: true,
    message: `Skill equipada: ${skill.name}.`,
    skill
  };
}

export function unequipSkill(character, skillId) {
  const book = ensureSkillBook(character);

  book.equipped = book.equipped.filter(id => id !== skillId);

  return {
    ok: true,
    message: "Skill removida da barra."
  };
}

export function getSkillDetails(skill) {
  if (!skill) return "";

  const scaling = skill.scaling
    ? Object.entries(skill.scaling)
        .map(([attr, value]) => `${attr} x${value}`)
        .join(", ")
    : "Nenhum";

  return `
${skill.icon || "✨"} ${skill.name}
Tipo: ${skill.type}
Tier: ${skill.tier}
Nível necessário: ${skill.minLevel || 1}
Mana: ${skill.manaCost || 0}
Cooldown: ${skill.cooldown || 0}
Poder base: ${skill.power || 0}
Escala com: ${scaling}

${skill.description || ""}
`;
}