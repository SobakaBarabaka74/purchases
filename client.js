/*
	Режим покупок. 
	Ps: Создал потому что понравилось играть в оригинальный режим. Но там
	какое то говно если честно :)
*/

// Создание команд
Teams.Add('Team', '<b><size=40>T</size><size=30>eam</size></b>', { g: 80, r: 2, b: 12 });
var team = Teams.Get('Team');
team.Spawns.SpawnPointsGroups.Add(1);

// Настройки
Properties.GetContext().GameModeName.Value = 'GameMode/Purchases';

var inventory = Inventory.GetContext();
inventory.Main.Value = false;
inventory.Secondary.Value = false;
inventory.Explosive.Value = false;
inventory.Build.Value = false;

BreackGraph.Damage = false;

Build.GetContext().LoadMapEnable.Value = false;

Spawns.GetContext().RespawnTime.Value = 0;

// Сохранение
var props = Properties.GetContext();
var data = {
	prop: ['Kills', 'Scores'], 
	defaultValue: [0, 0]
}

Players.OnPlayerDisconnected.Add(function(p) {
	data.prop.forEach(function(el, index) {
		props.Get(el + p.id).Value = p.Properties.Get(el).Value;
	});
});

Players.OnPlayerConnected.Add(function(p) {
	data.prop.forEach(function(el, index) {
		p.Properties.Get(el).Value = props.Get(el + p.id).Value || data.defaultValue[index];
	});
});

// Вход в команду по запросу
Teams.OnRequestJoinTeam.Add(function(p) { team.Add(p); });
Teams.OnPlayerChangeTeam.Add(function(p) { p.Spawns.Spawn(); });

// Лидерборд
LeaderBoard.PlayerLeaderBoardValues = [
	{
		Value: 'Kills', 
		DisplayName: '<b>K</b>', 
		ShortDisplayName: '<b>K</b>'
	}, 
	{
		Value: 'Scores', 
		DisplayName: '<b>S</b>', 
		ShortDisplayName: '<b>S</b>'
	}
];

// Фармилка
// В название зоны нужно писать уровень зоны, от 1 до 3
var furm = AreaPlayerTriggerService.Get('Furm');
furm.Tags = ['furm'];
furm.Enable = true;
furm.OnEnter.Add(function(p, a) {
	let pt = p.Properties;
	switch (a.Name) {
		case '1':
			p.Timers.Get('furm1').RestartLoop(1);
			pt.Get('furm').Value = 'furm1';
			break;
		case '2':
			p.Timers.Get('furm2').RestartLoop(5);
			pt.Get('furm').Value = 'furm2';
			break;
		case '3':
			p.Timers.Get('furm3').RestartLoop(10);
			pt.Get('furm').Value = 'furm3';
			break;
		default:
			p.Ui.Hint.Value = 'UNKNOWN FURM: имя зоны не соответствует уровню';
	}
});
furm.OnExit.Add(function(p) {
	try {
		p.Timers.Get(p.Properties.Get('furm').Value).Stop();
		p.Properties.Get('furm').Value = null;
	} catch (err) { }
});

Timers.OnPlayerTimer.Add(function(t) {
	let p = t.Player;
	
	switch (t.Id) {
		case '1':
			p.Properties.Get('Scores').Value += 10;
			break;
		case '2':
			p.Properties.Get('Scores').Value += 50;
			break;
		case '3':
			p.Properties.Get('Scores').Value += 100;
			break;
	}
});