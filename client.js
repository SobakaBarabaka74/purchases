/*
	Режим покупок. 
	Ps: Создал потому что понравилось играть в оригинальный режим. Но там
	какое то говно если честно :)
*/ 

// DEFINES
var inventory = Inventory.GetContext(), props = Properties.GetContext();

// FUNCTIONA
var createTrigger = function (Name_, Tags_, Enable_) {
	let trigger = AreaPlayerTriggerService.Get(Name_);
	trigger.Tags = Tags_;
	trigger.Enable = Enable_;
	return trigger;
	
}, createView = function (Name_, Tags_, Enable_, Color_) {
	let view = AreaViewService.GetContext().Get(Name_);
	view.Tags = Tags_;
	view.Enable = Enable_;
	view.Color = Color_;
	return view;
}, createShopAttribyte = function (Name_, Price_, Cond_) {
	return {
		Name: Name_, 
		Price: Price_, 
		Cond: Cond_
	}
}

// Создание команд
Teams.Add('Team', '<b><size=40>T</size><size=30>eam</size></b>', { g: 80, r: 2, b: 12 });
var team = Teams.Get('Team');
team.Spawns.SpawnPointsGroups.Add(1);

// Настройки
inventory.Main.Value = false;
inventory.Secondary.Value = false;
inventory.Explosive.Value = false;
inventory.Build.Value = false;
// Выключаем ломание
BreackGraph.Damage = false;
// Делаем невозможным сменить карту
Build.GetContext().LoadMapEnable.Value = false;
// Ставим моментальный спавн
Spawns.GetContext().RespawnTime.Value = 0;

// Сохранение
var data = {
	prop: ['Kills', 'Scores', 'index'], 
	defaultValue: [0, 0, -1]
}

// Выход из сервера
Players.OnPlayerDisconnected.Add(function(p) {
	data.prop.forEach(function(el, index) {
		props.Get(el + p.id).Value = p.Properties.Get(el).Value;
	});
	
	p.Spawns.Spawn();
	p.Spawns.Despawn();
});

// Вход на сервер
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
// В название зоны нужно писать время ожидания, время * 10 = количество монет
var furmView = createView('Furm', ['furm'], true, { r: 1, g: 1, b: 1 }),
	furm = createTrigger('Furm', ['furm'], true);

furm.OnEnter.Add(function(p, a) {
	// Время ожидания
	let time = parseInt(a.Name);
	// Запускаем таймер
	p.Properties.Get('time').Value = time;
	p.Timers.Get('farm').Restart(time);
	// Вывод подсказки
	p.Ui.Hint.Value = 'Стойте в зоне ' + time + ' секунд';
	
	// Если монет дают меньше чем 100, то даём игроку бессмертие на время проведения в зоне
	if (time * 10 <= 100) p.Damage.DamageIn.Value = false;
});

// Обработчик выхода из зоны
furm.OnExit.Add(function(p) {
	try {
		p.Timers.Get('farm').Stop();
		p.Ui.Hint.Reset();
		p.Damage.DamageIn.Value = true;
	} catch (err) { }
});

// Магазин
createView('Next', ['next'], true, { g: 1 });
createView('Back', ['back'], true, { r: 1 });
createView('But', ['but'], true, { r: 1, g: 1 });

var next = createTrigger('Next', ['next'], true), back = createTrigger('Back', ['back'], true),
but = createTrigger('But', ['but'], true);

// Лист магазина
var shop = [
	createShopAttribyte('Вторичное оружие', 4600, function (p) {
		return p.inventory.Secondary.Value == true;
	}),
	createShopAttribyte('Основное оружие', 7900, function (p) {
		return p.inventory.Main.Value == true;
	})
];

// Создаём каждую зону отдельно
shop.forEach(function(el) {
	let area = createTrigger(el.Name, ['Shop'], true), 
		view = createView(el.Name, ['Shop'], true, { r: 1, g: 1, b: 1 });
		
	area.OnEnter.Add(function(p, a) {
		try {
		p.Ui.Hint.Value = shop[parseInt(a.Name)].Name + '. Цена: ' + shop[parseInt(a.Name)].Price;
		
		let prop = p.Properties;
		
		// Покупка
		if (prop.Get('choice').Value != undefined || prop.Get('choice').Value != null) {
			let sh = shop[prop.Get('choice').Value];
			if (sh.Cond(p) == true) {
				p.Ui.Hint.Value = 'товар уже приобретён';
				return;
			}
			if (prop.Get('Scores').Value >= sh.Price) {
				eval(sh.Cond(p) + '= true');
				p.Ui.Hint.Value = 'Успешно приобретено';
			}
			else {
				p.Ui.Hint.Value = 'недостаточно средств';
			}
		}
		
		// Выбраный магазин ( хранит индекс товара ) 
		prop.Get('choice').Value = parseInt(a.Name);
		} catch (err) { msg.Show(err); }
	});
});

// Таймер игрока
Timers.OnPlayerTimer.Add(function(t) {
	let id = t.Id, p = t.Player, prop = p.Properties;
	
	if (id == 'farm') {
		let time = prop.Get('time');
		prop.Get('Scores').Value += time.Value * 10;
		p.Timers.Get('farm').Restart(time.Value);
	}
});
