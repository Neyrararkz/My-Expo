import { describe, it, expect } from "vitest";
import sample from "./fixtures/sample.json";
import {
  artistName, hueBucket, maxPage, encodeExpo, decodeExpo, iiifUrl, sortIdsByDateStart, DEFAULT_TITLE,
} from "./art.js";

const byId = (id) => sample.find((w) => w.id === id);

describe("artistName", () => {
  it("берёт первую строку", () => {
    expect(artistName("Claude Monet\nFrench, 1840–1926")).toBe("Claude Monet");
  });
  it("убирает пробел перед переводом строки (работа 9372)", () => {
    expect(artistName(byId(9372).artist_display)).toBe("Cornelis Visscher");
  });
  it("строка без \\n возвращается целиком (работа 5522)", () => {
    expect(artistName(byId(5522).artist_display)).toBe("Egyptian");
  });
  it("null и undefined дают пустую строку", () => {
    expect(artistName(null)).toBe("");
    expect(artistName(undefined)).toBe("");
  });
});

describe("hueBucket", () => {
  it("работа 51719 (h=5) красная", () => {
    expect(hueBucket(byId(51719).color)).toBe("red");
  });
  it("работа 5522 (s=6) серая", () => {
    expect(hueBucket(byId(5522).color)).toBe("gray");
  });
  it("работа 2990 без цвета даёт null", () => {
    expect(hueBucket(byId(2990).color)).toBeNull();
  });
  it("границы групп включаются в верхнюю группу", () => {
    const g = (h) => hueBucket({ h, s: 50, l: 50 });
    expect([g(0), g(14), g(15), g(44), g(45), g(69), g(70)])
      .toEqual(["red", "red", "orange", "orange", "yellow", "yellow", "green"]);
    expect([g(169), g(170), g(259), g(260), g(344), g(345), g(359)])
      .toEqual(["green", "blue", "blue", "purple", "purple", "red", "red"]);
  });
});

describe("maxPage", () => {
  it("считает страницы", () => {
    expect(maxPage(45, 20)).toBe(3);
  });
  it("ограничивает 10 000 результатов", () => {
    expect(maxPage(25000, 24)).toBe(416);
    expect(maxPage(133375, 24)).toBe(416);
  });
  it("ничего не найдено даёт 0", () => {
    expect(maxPage(0, 24)).toBe(0);
  });
});

describe("encodeExpo / decodeExpo", () => {
  it("пример из задания", () => {
    expect(decodeExpo("?ids=5,abc,5,-3,7")).toEqual({ title: DEFAULT_TITLE, ids: [5, 7] });
  });
  it("не больше 12 id", () => {
    const ids = Array.from({ length: 20 }, (_, i) => i + 1).join(",");
    expect(decodeExpo("?ids=" + ids).ids).toHaveLength(12);
  });
  it("пустое название заменяется на DEFAULT_TITLE", () => {
    expect(decodeExpo("?title=%20%20&ids=1").title).toBe(DEFAULT_TITLE);
  });
  it("кодирует и декодирует обратно", () => {
    const expo = { title: "Кошки & коты", ids: [3, 1, 2] };
    expect(decodeExpo(encodeExpo(expo))).toEqual(expo);
  });
});

describe("iiifUrl", () => {
  it("собирает адрес из config.iiif_url", () => {
    expect(iiifUrl("https://www.artic.edu/iiif/2", byId(5522).image_id))
      .toBe("https://www.artic.edu/iiif/2/07b26469-589f-e3e0-dd58-be1d4daad30d/full/843,/0/default.jpg");
  });
  it("без image_id даёт null (работа 2990)", () => {
    expect(iiifUrl("https://www.artic.edu/iiif/2", byId(2990).image_id)).toBeNull();
  });
});

describe("sortIdsByDateStart", () => {
  const worksById = Object.fromEntries(sample.map((w) => [w.id, w]));

  it("сортирует по возрастанию года, отрицательные годы первыми", () => {
    expect(sortIdsByDateStart([51719, 5522, 2990, 9372], worksById)).toEqual([5522, 2990, 9372, 51719]);
  });
  it("работы без данных уходят в конец с сохранением порядка", () => {
    expect(sortIdsByDateStart([999, 51719, 888, 5522], worksById)).toEqual([5522, 51719, 999, 888]);
  });
  it("не меняет исходный массив", () => {
    const ids = [51719, 5522];
    sortIdsByDateStart(ids, worksById);
    expect(ids).toEqual([51719, 5522]);
  });
  it("пустой список даёт пустой список", () => {
    expect(sortIdsByDateStart([], worksById)).toEqual([]);
  });
});