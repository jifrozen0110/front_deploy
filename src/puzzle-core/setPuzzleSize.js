export const setPuzzleSize = (puzzle, size) => {
    const bounds = puzzle.bounds; // 현재 퍼즐의 bounds 가져오기
    const scale = size / bounds.width; // X축 배율 계산

    puzzle.scale(scale); // X, Y 배율에 맞게 스케일 조정
};
