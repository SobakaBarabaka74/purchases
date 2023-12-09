try {

/*
	Режим покупок. 
	Ps: Создал потому что понравилось играть в оригинальный режим. Но там
	какое то говно если честно :)
*/

// Создание команд
Teams.Add('Team', '<b><size=40>T</size><size=30>eam</size></b>', { g: 60, r: 2, b: 12 });
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

// Функции
// Создание зоны
const options = {
	trigger: 'Test', 
	tags: ['Test'], 
	enable: true, 
	view: true, 
	color: { r: 0 }, 
	onEnter: function (p) {
		p.Ui.Hint.Value = 'Hi!';
	}
}

function createArea(settings = {}) {
	let ns = Object.assign(settings, options);
	let area = AreaPlayerTriggerService.Get(ns.trigger);
	
	area.Tags = ns.tags;
	area.Enable = ns.enable;
	area.OnEnter.Add(ns.onEnter(p, a));
	
	if (ns.view) {
		let view = AreaViewService.Get(ns.trigger);
		view.Color = ns.color;
		view.Enable = true;
		view.Tags = ns.tags;
	}
	
	return area;
}

} catch (err) { msg.ShowError(err); }