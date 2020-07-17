function makeBondsArray() {
  return [
    {
      id: 1,
      name: 'Mom',
      birthday: '04/21',
      notes:
        'Prefers video chat when possible.\nWhen would be a good time to visit next?',
    },
    {
      id: 2,
      name: 'Justin Wellum',
      birthday: '07/06',
      notes:
        'Enjoys recieving gifts - possibly something new for his house?\n\nPlanning on having him and Maddy over for dinner soon.',
    },
    {
      id: 3,
      name: 'Grandma',
      birthday: '02/18',
      notes:
        'Loves to get hand written letters. Also enjoys Facebook messages.\nBe sure to ask about the new puppy.',
    },
  ];
}

function makeMaliciousBond() {
  const maliciousBond = {
    id: 911,
    name: 'Naughty naughty very naughty <script>alert("xss");</script>',
    birthday: '04/21',
    notes: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
  };
  const expectedBond = {
    ...maliciousBond,
    name:
      'Naughty naughty very naughty &lt;script&gt;alert("xss");&lt;/script&gt;',
    notes: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
  };
  return {
    maliciousBond,
    expectedBond,
  };
}

module.exports = {
  makeBondsArray,
  makeMaliciousBond,
};
