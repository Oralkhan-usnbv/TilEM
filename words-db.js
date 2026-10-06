// Формат строки: "Казахское|English" (несколько переводов через запятую)
// Транскрипция строится автоматически.
const KK_DICT_RAW = [
  // Приветствия и вежливость
  "Сәлем|Hello", "Сәлеметсіз бе|Hello (formal)", "Қайырлы таң|Good morning",
  "Қайырлы күн|Good afternoon", "Қайырлы кеш|Good evening", "Қайырлы түн|Good night",
  "Сау бол|Goodbye", "Рақмет|Thank you", "Өтінемін|Please", "Кешіріңіз|Sorry, Excuse me",
  "Иә|Yes", "Жоқ|No",
  // Прилагательные
  "Жақсы|Good", "Жаман|Bad", "Әдемі|Beautiful", "Үлкен|Big", "Кіші|Small",
  "Жаңа|New", "Ескі|Old", "Дәмді|Delicious", "Жылы|Warm", "Суық|Cold", "Ыстық|Hot",
  // Люди и семья
  "Дос|Friend", "Отбасы|Family", "Ана|Mother", "Әке|Father", "Аға|Older brother",
  "Іні|Younger brother", "Әпке|Older sister", "Қарындас|Younger sister",
  "Ата|Grandfather", "Әже|Grandmother", "Бала|Child", "Ұл|Son", "Қыз|Daughter",
  "Адам|Person", "Ер адам|Man", "Әйел|Woman",
  // Дом и школа
  "Үй|Home, House", "Мектеп|School", "Сынып|Class", "Мұғалім|Teacher",
  "Оқушы|Student, Pupil", "Кітап|Book", "Дәптер|Notebook", "Қалам|Pen",
  // Еда (базовая)
  "Су|Water", "Тамақ|Food", "Нан|Bread", "Шай|Tea", "Кофе|Coffee", "Сүт|Milk",
  "Ет|Meat", "Балық|Fish", "Алма|Apple", "Қант|Sugar", "Тұз|Salt", "Күріш|Rice",
  "Жұмыртқа|Egg", "Сорпа|Soup",
  // Время
  "Бүгін|Today", "Ертең|Tomorrow", "Кеше|Yesterday", "Қазір|Now", "Уақыт|Time",
  "Күн|Day, Sun", "Түн|Night", "Апта|Week", "Ай|Month, Moon", "Жыл|Year",
  "Таңертең|Morning", "Кеш|Evening",
  // Числа
  "Бір|One", "Екі|Two", "Үш|Three", "Төрт|Four", "Бес|Five", "Алты|Six",
  "Жеті|Seven", "Сегіз|Eight", "Тоғыз|Nine", "Он|Ten", "Жүз|Hundred", "Мың|Thousand",
  // Цвета
  "Қызыл|Red", "Көк|Blue", "Жасыл|Green", "Сары|Yellow", "Ақ|White", "Қара|Black",
  // Город и транспорт
  "Қала|City", "Ауыл|Village", "Көше|Street", "Дүкен|Shop, Store", "Базар|Market",
  "Көлік|Car", "Автобус|Bus", "Пойыз|Train", "Ұшақ|Airplane", "Жол|Road",
  // Вопросы и местоимения
  "Қайда|Where", "Не|What", "Кім|Who", "Қашан|When", "Неге|Why", "Қалай|How",
  "Қанша|How much", "Мен|I", "Сен|You (informal)", "Сіз|You (formal)",
  "Ол|He, She, It", "Біз|We", "Олар|They",
  // Глаголы
  "Бару|To go", "Келу|To come", "Жеу|To eat", "Ішу|To drink", "Көру|To see",
  "Оқу|To read, To study", "Жазу|To write", "Сөйлеу|To speak", "Білу|To know",
  "Сүю|To love", "Алу|To take, To buy", "Беру|To give",
  // Разное
  "Жұмыс|Work", "Ақша|Money", "Баға|Price", "Тіл|Language", "Қазақша|In Kazakh",
  "Ағылшынша|In English", "Қазақстан|Kazakhstan", "Бақыт|Happiness",
  "Махаббат|Love", "Арман|Dream",
  // Природа и животные
  "Табиғат|Nature", "Тау|Mountain", "Өзен|River", "Көл|Lake", "Аспан|Sky",
  "Жел|Wind", "Қар|Snow", "Жаңбыр|Rain", "Ит|Dog", "Мысық|Cat", "Жылқы|Horse",
  "Қой|Sheep", "Сиыр|Cow", "Құс|Bird",
  // Тело
  "Жүрек|Heart", "Көз|Eye", "Қол|Hand", "Бас|Head", "Аяқ|Foot, Leg",
  "Ауыз|Mouth", "Құлақ|Ear", "Мұрын|Nose",

  // ===================== ТЕМА: FOOD (А1) =====================

  // Приёмы пищи
  "Тағам|Dish, Meal", "Ас|Meal, Food", "Таңғы ас|Breakfast", "Түскі ас|Lunch",
  "Кешкі ас|Dinner", "Ауқат|Meal", "Дастархан|Dining table", "Қонақ|Guest",
  "Той|Feast, Wedding", "Ас болсын|Bon appétit", "Қонақасы|Hospitality meal",

  // Посуда
  "Ыдыс|Dishes", "Қасық|Spoon", "Шанышқы|Fork", "Пышақ|Knife", "Тәрелке|Plate",
  "Стакан|Glass", "Кесе|Cup", "Тостаған|Bowl", "Шәйнек|Kettle, Teapot",
  "Қазан|Large pot", "Таба|Frying pan", "Бөтелке|Bottle", "Банка|Jar",
  "Пакет|Bag", "Себет|Basket", "Майлық|Napkin",

  // Места и люди
  "Мейрамхана|Restaurant", "Кафе|Cafe", "Асхана|Canteen", "Ас үй|Kitchen",
  "Наубайхана|Bakery", "Мәзір|Menu", "Тапсырыс|Order", "Шот|Bill",
  "Даяшы|Waiter", "Аспаз|Cook, Chef", "Тоңазытқыш|Refrigerator", "Пеш|Oven, Stove",

  // Мясо и жиры
  "Сиыр еті|Beef", "Қой еті|Mutton", "Жылқы еті|Horse meat", "Тауық|Chicken",
  "Қаз|Goose", "Үйрек|Duck", "Күркетауық|Turkey", "Шұжық|Sausage",
  "Қазы|Kazy (horse meat sausage)", "Бауыр|Liver", "Сүйек|Bone", "Қайма|Minced meat",
  "Котлет|Cutlet", "Май|Fat, Butter, Oil", "Сары май|Butter",
  "Өсімдік майы|Vegetable oil", "Уылдырық|Caviar", "Шаян|Crab, Crayfish",

  // Молочные продукты
  "Қаймақ|Sour cream", "Айран|Ayran (sour milk drink)", "Қымыз|Kumis (mare's milk drink)",
  "Шұбат|Shubat (camel milk drink)", "Ірімшік|Cheese", "Сүзбе|Cottage cheese",
  "Йогурт|Yogurt", "Құрт|Kurt (dried cheese)", "Қатық|Katyk (fermented milk)",
  "Балмұздақ|Ice cream", "Кілегей|Cream",

  // Хлеб, выпечка, блюда
  "Тоқаш|Round bread", "Бауырсақ|Baursak (fried dough)", "Шелпек|Shelpek (flatbread)",
  "Торт|Cake", "Печенье|Cookie", "Бәліш|Belish (meat pie)", "Самса|Samsa",
  "Ұн|Flour", "Қамыр|Dough", "Макарон|Pasta", "Кеспе|Noodles", "Лағман|Laghman",
  "Бесбармақ|Beshbarmak", "Манты|Manti", "Тұшпара|Dumplings", "Палау|Pilaf",
  "Ботқа|Porridge", "Салат|Salad", "Бутерброд|Sandwich", "Пицца|Pizza",

  // Крупы и бобовые
  "Сұлы|Oats", "Қарақұмық|Buckwheat", "Тары|Millet", "Бидай|Wheat", "Арпа|Barley",
  "Жүгері|Corn", "Бұршақ|Peas, Beans", "Жасымық|Lentils",

  // Овощи
  "Көкөніс|Vegetables", "Картоп|Potato", "Сәбіз|Carrot", "Пияз|Onion",
  "Сарымсақ|Garlic", "Қырыққабат|Cabbage", "Қияр|Cucumber", "Қызанақ|Tomato",
  "Бұрыш|Pepper", "Баялды|Eggplant", "Асқабақ|Pumpkin", "Шалқан|Turnip",
  "Қызылша|Beet", "Шалғам|Radish", "Саңырауқұлақ|Mushroom",

  // Фрукты, ягоды, орехи
  "Жеміс|Fruit", "Алмұрт|Pear", "Банан|Banana", "Апельсин|Orange", "Лимон|Lemon",
  "Мандарин|Mandarin", "Жүзім|Grape", "Шие|Cherry", "Құлпынай|Strawberry",
  "Таңқурай|Raspberry", "Өрік|Apricot", "Шабдалы|Peach", "Алхоры|Plum",
  "Қарбыз|Watermelon", "Қауын|Melon", "Анар|Pomegranate", "Інжір|Fig",
  "Ананас|Pineapple", "Жидек|Berry", "Мейіз|Raisins", "Құрма|Dates",
  "Жаңғақ|Nut", "Грек жаңғағы|Walnut", "Бадам|Almond", "Жержаңғақ|Peanut",

  // Напитки
  "Сусын|Drink", "Шырын|Juice", "Лимонад|Lemonade", "Кола|Cola",
  "Минералды су|Mineral water", "Қайнаған су|Boiled water", "Мұз|Ice", "Какао|Cocoa",
  "Қара шай|Black tea", "Жасыл шай|Green tea", "Сүтті шай|Tea with milk", "Компот|Compote",

  // Сладости
  "Тәтті|Sweet", "Тәттілер|Sweets", "Кәмпит|Candy", "Шоколад|Chocolate",
  "Бал|Honey", "Тосап|Jam", "Халуа|Halva",

  // Специи и соусы
  "Дәмдеуіш|Spice, Seasoning", "Қара бұрыш|Black pepper", "Сірке суы|Vinegar",
  "Соус|Sauce", "Майонез|Mayonnaise", "Кетчуп|Ketchup", "Зире|Cumin",

  // Вкус и состояние
  "Дәм|Taste", "Дәмсіз|Tasteless", "Қышқыл|Sour", "Ащы|Spicy, Bitter",
  "Тұщы|Fresh, Not salty", "Тұзды|Salty", "Піскен|Cooked, Ripe", "Шикі|Raw",
  "Қуырылған|Fried", "Қайнатылған|Boiled", "Балғын|Fresh", "Қою|Thick",
  "Сұйық|Liquid, Thin", "Қатты|Hard", "Жұмсақ|Soft", "Майлы|Fatty, Oily",
  "Тоқ|Full (not hungry)", "Аш|Hungry", "Аштық|Hunger", "Шөл|Thirst",
  "Тәбет|Appetite", "Иіс|Smell",

  // Глаголы на кухне и в кафе
  "Пісіру|To cook, To bake", "Қуыру|To fry", "Қайнату|To boil", "Кесу|To cut",
  "Араластыру|To mix", "Дайындау|To prepare", "Тамақтану|To have a meal",
  "Дәмін көру|To taste", "Қосу|To add", "Тапсырыс беру|To order", "Төлеу|To pay",
  "Шақыру|To invite", "Жуу|To wash", "Төгу|To pour", "Салу|To put in",
  "Сатып алу|To buy", "Сату|To sell"
];