// Выдача инвентаря по таймеру
// Можно добавить в свой режим в качестве красивой и крутой фишки


// Те оружия которые будут выданы игроку
const WEAPONS = ['Main', 'Secondary', 'Melee', 'Explosive', 'Build'], 
  UPDATING_TIME = 1; // Время обновления оружия

// Таймер 
Timers.OnPlayerTimer.Add(function(t) {
  let p = t.Player, 
    id = t.Id, 
    prop = p.Properties;
    
  if (id == 'inventory') {
    if (prop.Get('index').Value < (WEAPONS.length - 1)) {
      p.inventory[WEAPONS[prop.Get('index')]].Value = true;
      prop.Get('index').Value += 1;
      p.Timers.Restart(UPDATING_TIME);
    }
    else {
      prop.Get('index').Value = 0;
    }
  }
});

// Создаём команды
Teams.Add('Blue', 'Blue', { b: 1 });
Teams.Add('Red', 'Red', { r: 1 });

// Забираем инвентарь
WEAPONS.forEach(function(weapon) {
  Inventory.GetContext()[weapon].Value = false;
});

// На всякий случай, ставим в индекс выдачи значение 0
Teams.OnRequestJoinTeam.Add(function(p, t) {
  t.add(p);
  p.Properties.Get('index').Value = 0;
  p.Spawns.Spawn();
  
  // Тестируем
  p.Timers.Restart(UPDATING_TIME);
});
